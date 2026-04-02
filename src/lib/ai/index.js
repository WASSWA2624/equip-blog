import { PostStatus } from "@prisma/client";
import { z } from "zod";

import { getMessages } from "@/features/i18n/get-messages";
import { detectDuplicateEquipmentPost } from "@/lib/generation/duplicates";
import { generationStageOrder, generationTerminalStageIds } from "@/lib/generation/stages";
import { buildMarkdownFromStructuredArticle, buildHtmlFromStructuredArticle } from "@/lib/markdown";
import { createCanonicalEquipmentIdentity, normalizeDisplayText } from "@/lib/normalization";
import { buildVerifiedResearchPayload } from "@/lib/research";
import { buildSeoPayload } from "@/lib/seo";

import { getFixtureByNormalizedEquipmentName } from "./fixture-data";

export const promptTemplatePurposeOrder = Object.freeze([
  "system_instruction",
  "data_grounding",
  "output_json_structure",
  "article_formatting",
  "safety_boundaries",
]);

export const generatedArticleSectionOrder = Object.freeze([
  "featured_image",
  "definition_and_overview",
  "principle_of_operation",
  "components_and_parts",
  "types_and_variants",
  "uses_and_applications",
  "commonly_used_manufacturers",
  "commonly_encountered_models",
  "faults_and_remedies",
  "daily_care_and_maintenance",
  "preventive_maintenance_schedule",
  "safety_precautions",
  "sop_and_how_to_use_guidance",
  "manuals_and_technical_documents",
  "faq",
  "references",
  "disclaimer",
]);

export const savePromptTemplatesSchema = z.object({
  templates: z
    .array(
      z
        .object({
          id: z.string().trim().min(1),
          isActive: z.boolean(),
          name: z.string().trim().min(1),
          purpose: z.enum(promptTemplatePurposeOrder),
          systemPrompt: z.string().trim().min(1),
          userPromptTemplate: z.string().trim().min(1),
        })
        .strict(),
    )
    .min(1),
});

export class AiCompositionError extends Error {
  constructor(message, { details = null, status = "ai_composition_error", statusCode = 500 } = {}) {
    super(message);
    this.name = "AiCompositionError";
    this.details = details;
    this.status = status;
    this.statusCode = statusCode;
  }
}

function dedupeStrings(values) {
  return [...new Set((values || []).map((value) => `${value}`.trim()).filter(Boolean))];
}

function compareAlphabetical(left, right) {
  return left.localeCompare(right, undefined, {
    sensitivity: "base",
  });
}

function toSerializableJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function chunkList(values, count) {
  return values.slice(0, count);
}

function renderTemplate(template, variables) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const value = variables[key];

    if (value === undefined || value === null) {
      return "";
    }

    return `${value}`;
  });
}

async function resolvePrismaClient(prisma) {
  if (prisma) {
    return prisma;
  }

  const { getPrismaClient } = await import("@/lib/prisma");

  return getPrismaClient();
}

function createPromptTemplateSummary(template) {
  return {
    id: template.id,
    isActive: template.isActive,
    name: template.name,
    purpose: template.purpose,
    systemPrompt: template.systemPrompt,
    updatedAt: template.updatedAt instanceof Date ? template.updatedAt.toISOString() : null,
    userPromptTemplate: template.userPromptTemplate,
    version: template.version,
  };
}

function selectActivePromptTemplates(templates) {
  const activeTemplatesByPurpose = new Map();

  for (const purpose of promptTemplatePurposeOrder) {
    const activeTemplate = templates
      .filter((template) => template.purpose === purpose && template.isActive)
      .sort((left, right) => right.version - left.version)[0];

    if (!activeTemplate) {
      throw new AiCompositionError(`An active prompt template is required for "${purpose}".`, {
        status: "missing_prompt_template",
        statusCode: 500,
      });
    }

    activeTemplatesByPurpose.set(purpose, activeTemplate);
  }

  return promptTemplatePurposeOrder.map((purpose) => activeTemplatesByPurpose.get(purpose));
}

export async function getPromptConfigurationSnapshot(prisma) {
  const db = await resolvePrismaClient(prisma);
  const templates = await db.promptTemplate.findMany({
    orderBy: [{ purpose: "asc" }, { version: "desc" }],
    select: {
      id: true,
      isActive: true,
      name: true,
      purpose: true,
      systemPrompt: true,
      updatedAt: true,
      userPromptTemplate: true,
      version: true,
    },
  });

  return {
    summary: {
      activeTemplateCount: templates.filter((template) => template.isActive).length,
      purposeCount: new Set(templates.map((template) => template.purpose)).size,
      templateCount: templates.length,
    },
    templates: templates.map(createPromptTemplateSummary),
  };
}

export async function savePromptTemplates(input, options = {}, prisma) {
  const parsedInput = savePromptTemplatesSchema.parse(input);
  const db = await resolvePrismaClient(prisma);

  for (const purpose of promptTemplatePurposeOrder) {
    const hasActiveTemplate = parsedInput.templates.some(
      (template) => template.isActive && template.purpose === purpose,
    );

    if (!hasActiveTemplate) {
      throw new AiCompositionError(`At least one active prompt template is required for "${purpose}".`, {
        status: "missing_prompt_template",
        statusCode: 400,
      });
    }
  }

  await db.$transaction(async (tx) => {
    for (const template of parsedInput.templates) {
      await tx.promptTemplate.update({
        where: {
          id: template.id,
        },
        data: {
          isActive: template.isActive,
          name: template.name,
          systemPrompt: template.systemPrompt,
          userPromptTemplate: template.userPromptTemplate,
        },
      });
    }

    if (options.actorId) {
      await tx.auditEvent.create({
        data: {
          action: "PROMPT_TEMPLATE_UPDATED",
          actorId: options.actorId,
          entityId: "prompt_template_collection",
          entityType: "prompt_template",
          payloadJson: {
            templates: parsedInput.templates.map((template) => ({
              id: template.id,
              isActive: template.isActive,
            })),
          },
        },
      });
    }
  });

  return {
    snapshot: await getPromptConfigurationSnapshot(db),
  };
}

export async function loadActivePromptLayers(prisma) {
  const db = await resolvePrismaClient(prisma);
  const templates = await db.promptTemplate.findMany({
    orderBy: [{ purpose: "asc" }, { version: "desc" }],
    select: {
      id: true,
      isActive: true,
      name: true,
      purpose: true,
      systemPrompt: true,
      userPromptTemplate: true,
      version: true,
    },
  });

  return selectActivePromptTemplates(templates);
}

function getGenerationModeProfile(articleDepth) {
  if (articleDepth === "fast") {
    return {
      faqCount: 3,
      overviewSentenceCount: 2,
      sectionIntroTone: "concise",
    };
  }

  if (articleDepth === "repair") {
    return {
      faqCount: 4,
      overviewSentenceCount: 3,
      sectionIntroTone: "troubleshooting",
    };
  }

  if (articleDepth === "maintenance") {
    return {
      faqCount: 4,
      overviewSentenceCount: 3,
      sectionIntroTone: "maintenance",
    };
  }

  return {
    faqCount: 5,
    overviewSentenceCount: 4,
    sectionIntroTone: "complete",
  };
}

function formatAudienceLabel(audience) {
  return audience.replace(/_/g, " ");
}

function buildPromptVariables({
  article,
  articleDepth,
  disclaimer,
  equipmentName,
  locale,
  researchPayload,
  targetAudience,
}) {
  return {
    articleDepth,
    articleJson: article ? JSON.stringify(article, null, 2) : "",
    equipmentName,
    locale,
    researchPayloadJson: JSON.stringify(researchPayload, null, 2),
    sectionOrderJson: JSON.stringify(generatedArticleSectionOrder, null, 2),
    targetAudienceList: targetAudience.map(formatAudienceLabel).join(", "),
    disclaimer,
  };
}

function buildPromptBundle({ article, promptLayers, request, researchPayload, disclaimer }) {
  const variables = buildPromptVariables({
    article,
    articleDepth: request.articleDepth,
    disclaimer,
    equipmentName: request.equipmentName,
    locale: request.locale,
    researchPayload,
    targetAudience: request.targetAudience,
  });

  return promptLayers.map((layer) => ({
    id: layer.id,
    name: layer.name,
    purpose: layer.purpose,
    renderedSystemPrompt: renderTemplate(layer.systemPrompt, variables),
    renderedUserPrompt: renderTemplate(layer.userPromptTemplate, variables),
    version: layer.version,
  }));
}

function createSection(id, title, payload) {
  return {
    id,
    title,
    ...payload,
  };
}

function collectSourceReferenceIds(entries) {
  return dedupeStrings(
    (entries || []).flatMap((entry) => entry.sourceReferenceIds || []),
  );
}

function buildOverviewParagraphs(researchPayload, request) {
  const profile = getGenerationModeProfile(request.articleDepth);
  const audiences = request.targetAudience.map(formatAudienceLabel).join(", ");
  const paragraphs = [
    researchPayload.definition?.summary || `${request.equipmentName} overview information was verified from the acceptance fixture.`,
    researchPayload.operatingPrinciple?.summary || "",
    `This ${request.articleDepth} guide is written for ${audiences} and keeps verified facts separate from instructional summary language.`,
  ].filter(Boolean);

  if (profile.sectionIntroTone === "troubleshooting") {
    paragraphs.push(
      "Troubleshooting and recovery actions are emphasized so that the guide remains practical for service-oriented review.",
    );
  }

  if (profile.sectionIntroTone === "maintenance") {
    paragraphs.push(
      "Preventive care, cleaning discipline, and safe inspection routines are emphasized to support equipment reliability.",
    );
  }

  return chunkList(paragraphs, profile.overviewSentenceCount);
}

function buildManufacturersSection(researchPayload) {
  return createSection("commonly_used_manufacturers", "Commonly used manufacturers", {
    intro:
      "These manufacturers are ordered deterministically from the verified research package. The list represents the best supported set in the current evidence bundle rather than a claimed worldwide rank.",
    items: researchPayload.manufacturers.map((manufacturer) => ({
      description: [
        manufacturer.primaryDomain,
        manufacturer.headquartersCountry ? `Headquarters: ${manufacturer.headquartersCountry}` : null,
        manufacturer.branchCountries?.length
          ? `Verified branch countries: ${manufacturer.branchCountries.join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join(" | "),
      sourceReferenceIds: manufacturer.sourceReferenceIds,
      title: manufacturer.name,
    })),
    kind: "list",
    sourceReferenceIds: collectSourceReferenceIds(researchPayload.manufacturers),
  });
}

function buildModelsSection(researchPayload) {
  return createSection("commonly_encountered_models", "Commonly encountered models by manufacturer", {
    groups: researchPayload.manufacturers
      .filter((manufacturer) => manufacturer.models?.length)
      .map((manufacturer) => ({
        manufacturer: manufacturer.name,
        models: manufacturer.models.map((model) => ({
          latestKnownYear: model.latestKnownYear,
          name: model.name,
          sourceReferenceIds: model.sourceReferenceIds,
          summary: model.summary,
        })),
      })),
    intro:
      "Model groupings stay under the canonical manufacturer record so aliases do not create duplicate sections.",
    kind: "models_by_manufacturer",
    sourceReferenceIds: collectSourceReferenceIds(
      researchPayload.manufacturers.flatMap((manufacturer) => manufacturer.models || []),
    ),
  });
}

function buildFaultsSection(researchPayload) {
  return createSection("faults_and_remedies", "Faults and remedies", {
    items: researchPayload.faults.map((fault) => ({
      cause: fault.cause,
      remedy: fault.remedy,
      severity: fault.severity,
      sourceReferenceIds: fault.sourceReferenceIds,
      symptoms: fault.symptoms,
      title: fault.title,
    })),
    kind: "faults",
    sourceReferenceIds: collectSourceReferenceIds(researchPayload.faults),
  });
}

function splitMaintenanceTasks(researchPayload) {
  const dailyTasks = [];
  const scheduledTasks = [];

  for (const task of researchPayload.maintenanceTasks || []) {
    const frequency = `${task.frequency || ""} ${task.label || ""} ${task.details || ""}`
      .toLowerCase();

    if (frequency.includes("daily") || frequency.includes("pre-use") || frequency.includes("before each")) {
      dailyTasks.push(task);
      continue;
    }

    scheduledTasks.push(task);
  }

  if (!dailyTasks.length && scheduledTasks.length) {
    dailyTasks.push(...scheduledTasks.slice(0, Math.min(2, scheduledTasks.length)));
  }

  return {
    dailyTasks,
    scheduledTasks: scheduledTasks.length ? scheduledTasks : dailyTasks,
  };
}

function buildMaintenanceSections(researchPayload) {
  const { dailyTasks, scheduledTasks } = splitMaintenanceTasks(researchPayload);

  return [
    createSection("daily_care_and_maintenance", "Daily care and maintenance", {
      intro:
        "Daily care tasks should be completed consistently so the optical path stays clean and the instrument is ready for the next verified workflow.",
      items: dailyTasks.map((task) => ({
        description: task.details || "",
        sourceReferenceIds: task.sourceReferenceIds,
        title: task.label,
      })),
      kind: "list",
      sourceReferenceIds: collectSourceReferenceIds(dailyTasks),
    }),
    createSection("preventive_maintenance_schedule", "Preventive maintenance schedule", {
      intro:
        "Preventive maintenance intervals should follow the operator guide, service notes, and institutional biomedical engineering policy.",
      items: scheduledTasks.map((task) => ({
        description: task.details
          ? `${task.details}${task.frequency ? ` (${task.frequency})` : ""}`
          : task.frequency || task.label,
        sourceReferenceIds: task.sourceReferenceIds,
        title: task.label,
      })),
      kind: "list",
      sourceReferenceIds: collectSourceReferenceIds(scheduledTasks),
    }),
  ];
}

function buildSopSection(researchPayload, fixture) {
  const modelDifferenceNote = researchPayload.manufacturers
    .flatMap((manufacturer) => manufacturer.models || [])
    .slice(0, 2)
    .map((model) => `${model.name}: ${model.summary || "follow the manufacturer-specific operator guide."}`);

  return createSection("sop_and_how_to_use_guidance", "SOP and how-to-use guidance", {
    intro:
      "These SOP-style steps summarize the verified workflow and should always be checked against the official operator manual for the exact model in use.",
    kind: "steps",
    sourceReferenceIds: collectSourceReferenceIds([
      researchPayload.operatingPrinciple || {},
      ...(researchPayload.safetyPrecautions || []),
      ...(researchPayload.maintenanceTasks || []),
    ]),
    steps: [
      ...(fixture.compositionNotes.howToUseSteps || []),
      ...(modelDifferenceNote.length
        ? [
            {
              description: modelDifferenceNote.join(" "),
              title: "Apply model-specific differences inline",
            },
          ]
        : []),
    ],
  });
}

function buildFaqSection(researchPayload, request) {
  const profile = getGenerationModeProfile(request.articleDepth);
  const faqItems = [
    {
      answer:
        researchPayload.definition?.summary ||
        "A microscope magnifies small specimens so they can be inspected safely and systematically.",
      question: "What is a microscope used for?",
    },
    {
      answer:
        researchPayload.operatingPrinciple?.summary ||
        "A microscope combines illumination with optical magnification to enlarge specimen detail.",
      question: "How does a microscope work?",
    },
    {
      answer:
        researchPayload.faults?.[0]?.remedy ||
        "Start with cleaning, illumination checks, and low-power refocusing before escalating to service review.",
      question: "What should I do first if the image is unclear?",
    },
    {
      answer:
        "Daily cleaning of optical surfaces and scheduled preventive maintenance reduce unexpected failures and image-quality drift.",
      question: "Why is routine microscope maintenance important?",
    },
    {
      answer:
        "Use only the model-specific operator manual, approved cleaning materials, and institutional biomedical engineering procedures for deeper service actions.",
      question: "Which documents should staff follow before maintenance or repair?",
    },
  ];

  return createSection("faq", "FAQ", {
    items: chunkList(faqItems, profile.faqCount),
    kind: "faq",
    sourceReferenceIds: collectSourceReferenceIds([
      researchPayload.definition || {},
      researchPayload.operatingPrinciple || {},
      ...(researchPayload.faults || []),
      ...(researchPayload.manuals || []),
      ...(researchPayload.maintenanceTasks || []),
    ]),
  });
}

function buildReferencesSection(researchPayload) {
  return createSection("references", "References", {
    items: researchPayload.sourceReferences.map((reference) => ({
      sourceType: reference.sourceType,
      title: reference.title,
      url: reference.url,
    })),
    kind: "references",
    sourceReferenceIds: researchPayload.sourceReferences.map((reference) => reference.id),
  });
}

function buildDisclaimerSection(disclaimer) {
  return createSection("disclaimer", "Disclaimer", {
    kind: "text",
    paragraphs: [disclaimer],
    sourceReferenceIds: [],
  });
}

function buildStructuredArticle({ disclaimer, fixture, providerConfig, request, researchPayload }) {
  const equipmentTitle = normalizeDisplayText(request.equipmentName) || researchPayload.equipment.name;
  const title =
    request.articleDepth === "repair"
      ? `${equipmentTitle}: Troubleshooting, Faults, Maintenance, and Manuals`
      : request.articleDepth === "maintenance"
        ? `${equipmentTitle}: Care, Maintenance, Safety, and Manuals`
        : `${equipmentTitle}: Definition, Operation, Maintenance, Faults, and Manuals`;
  const excerpt = [
    researchPayload.definition?.summary,
    request.articleDepth === "fast"
      ? "This concise draft keeps the required learning sequence while preserving the verified references and disclaimer."
      : "This structured draft follows the stable learning sequence, keeps disclaimer and references visible, and only expands on details supported by the verified research package.",
  ]
    .filter(Boolean)
    .join(" ");
  const imageCandidates = chunkList(researchPayload.mediaCandidates || [], 2);
  const baseSections = [
    createSection("featured_image", "Featured image", {
      images: imageCandidates,
      kind: "image_gallery",
      sourceReferenceIds: collectSourceReferenceIds(imageCandidates),
    }),
    createSection("definition_and_overview", "Definition and overview", {
      kind: "text",
      paragraphs: buildOverviewParagraphs(researchPayload, request),
      sourceReferenceIds: collectSourceReferenceIds([researchPayload.definition]),
    }),
    createSection("principle_of_operation", "Principle of operation", {
      kind: "text",
      paragraphs: [
        researchPayload.operatingPrinciple?.summary ||
          "The principle of operation was not fully verified in the current research bundle.",
        "Operators should treat this explanation as a synthesized orientation layer and use the official operator guide for exact model-specific controls.",
      ],
      sourceReferenceIds: collectSourceReferenceIds([researchPayload.operatingPrinciple]),
    }),
    createSection("components_and_parts", "Components and parts", {
      kind: "list",
      items: researchPayload.components.map((component) => ({
        description: component.details,
        sourceReferenceIds: component.sourceReferenceIds,
        title: component.label,
      })),
      sourceReferenceIds: collectSourceReferenceIds(researchPayload.components),
    }),
    createSection("types_and_variants", "Types and variants", {
      kind: "list",
      items: researchPayload.variants.map((variant) => ({
        description: variant.details,
        sourceReferenceIds: variant.sourceReferenceIds,
        title: variant.label,
      })),
      sourceReferenceIds: collectSourceReferenceIds(researchPayload.variants),
    }),
    createSection("uses_and_applications", "Uses and applications", {
      kind: "list",
      items: researchPayload.uses.map((useCase) => ({
        description: useCase.details,
        sourceReferenceIds: useCase.sourceReferenceIds,
        title: useCase.label,
      })),
      sourceReferenceIds: collectSourceReferenceIds(researchPayload.uses),
    }),
  ];
  const optionalSections = [];

  if (request.includeManufacturers && researchPayload.manufacturers.length) {
    optionalSections.push(buildManufacturersSection(researchPayload));
  }

  if (request.includeModels && researchPayload.manufacturers.some((manufacturer) => manufacturer.models?.length)) {
    optionalSections.push(buildModelsSection(researchPayload));
  }

  if (request.includeFaults && researchPayload.faults.length) {
    optionalSections.push(buildFaultsSection(researchPayload));
  }

  optionalSections.push(...buildMaintenanceSections(researchPayload));
  optionalSections.push(
    createSection("safety_precautions", "Safety precautions", {
      kind: "list",
      items: researchPayload.safetyPrecautions.map((precaution) => ({
        description: precaution.details,
        sourceReferenceIds: precaution.sourceReferenceIds,
        title: precaution.label,
      })),
      sourceReferenceIds: collectSourceReferenceIds(researchPayload.safetyPrecautions),
    }),
  );
  optionalSections.push(buildSopSection(researchPayload, fixture));

  if (request.includeManualLinks && researchPayload.manuals.length) {
    optionalSections.push(
      createSection("manuals_and_technical_documents", "Manuals and technical documents", {
        items: researchPayload.manuals.map((manual) => ({
          fileType: manual.fileType,
          language: manual.language,
          sourceReferenceIds: manual.sourceReferenceIds,
          title: manual.title,
          url: manual.url,
        })),
        kind: "manuals",
        sourceReferenceIds: collectSourceReferenceIds(researchPayload.manuals),
      }),
    );
  }

  optionalSections.push(buildFaqSection(researchPayload, request));
  optionalSections.push(buildReferencesSection(researchPayload));
  optionalSections.push(buildDisclaimerSection(disclaimer));

  return {
    disclaimer,
    equipmentAliases: researchPayload.equipment.aliases,
    equipmentName: researchPayload.equipment.name,
    excerpt,
    faq: buildFaqSection(researchPayload, request).items,
    generationContext: {
      articleDepth: request.articleDepth,
      locale: request.locale,
      provider: providerConfig.provider,
      providerConfigId: providerConfig.id,
      targetAudience: request.targetAudience,
    },
    relatedKeywords: fixture.compositionNotes.relatedKeywords,
    sections: [...baseSections, ...optionalSections],
    slug: researchPayload.equipment.slug,
    structuredBlocks: {
      faq: buildFaqSection(researchPayload, request).items,
      faults: researchPayload.faults,
      maintenanceTasks: researchPayload.maintenanceTasks,
      models: researchPayload.manufacturers.flatMap((manufacturer) =>
        (manufacturer.models || []).map((model) => ({
          ...model,
          manufacturerName: manufacturer.name,
        })),
      ),
    },
    title,
  };
}

function validateStructuredArticle(article) {
  const sectionIds = article.sections.map((section) => section.id);

  for (const requiredId of [
    "definition_and_overview",
    "principle_of_operation",
    "daily_care_and_maintenance",
    "references",
    "disclaimer",
  ]) {
    if (!sectionIds.includes(requiredId)) {
      throw new AiCompositionError(`Generated draft is missing the "${requiredId}" section.`, {
        status: "invalid_generated_draft",
        statusCode: 500,
      });
    }
  }

  if (!article.title?.trim()) {
    throw new AiCompositionError("Generated draft title is required.", {
      status: "invalid_generated_draft",
      statusCode: 500,
    });
  }

  const orderedIds = [...sectionIds].sort(
    (left, right) =>
      generatedArticleSectionOrder.indexOf(left) - generatedArticleSectionOrder.indexOf(right),
  );

  if (orderedIds.join("|") !== sectionIds.join("|")) {
    throw new AiCompositionError("Generated sections are out of the required order.", {
      status: "invalid_generated_section_order",
      statusCode: 500,
    });
  }

  const manufacturersSection = article.sections.find(
    (section) => section.id === "commonly_used_manufacturers",
  );

  if (manufacturersSection) {
    const manufacturerTitles = manufacturersSection.items.map((item) => item.title);

    if (new Set(manufacturerTitles).size !== manufacturerTitles.length) {
      throw new AiCompositionError("Generated manufacturers section contains duplicate rows.", {
        status: "invalid_generated_draft",
        statusCode: 500,
      });
    }
  }

  const modelsSection = article.sections.find(
    (section) => section.id === "commonly_encountered_models",
  );

  if (modelsSection && modelsSection.groups.some((group) => !group.models.length)) {
    throw new AiCompositionError("Generated model groups must not be empty.", {
      status: "invalid_generated_draft",
      statusCode: 500,
    });
  }
}

function createProvider(providerConfig, options = {}) {
  if (providerConfig.provider !== "openai") {
    throw new AiCompositionError(
      `Provider "${providerConfig.provider}" is not supported by the composition pipeline.`,
      {
        status: "unsupported_provider",
        statusCode: 400,
      },
    );
  }

  return {
    model: providerConfig.model,
    name: providerConfig.provider,
    async composeStructuredArticle(context) {
      if (typeof options.composeStructuredArticle === "function") {
        return options.composeStructuredArticle(context);
      }

      return {
        executionMode: "deterministic_fixture",
        structuredArticle: buildStructuredArticle(context),
      };
    },
  };
}

async function resolveProviderConfig(providerConfigId, prisma) {
  const db = await resolvePrismaClient(prisma);
  const providerConfig = await db.modelProviderConfig.findUnique({
    where: {
      id: providerConfigId,
    },
  });

  if (!providerConfig || !providerConfig.isEnabled) {
    throw new AiCompositionError(
      `Provider configuration "${providerConfigId}" is not available for generation.`,
      {
        status: "invalid_provider_config",
        statusCode: 400,
      },
    );
  }

  return providerConfig;
}

async function getDefaultDisclaimer(locale) {
  const messages = await getMessages(locale);
  const disclaimer = messages?.post?.defaultDisclaimer;

  if (!disclaimer) {
    throw new AiCompositionError(`Locale "${locale}" is missing a default disclaimer.`, {
      status: "missing_default_disclaimer",
      statusCode: 500,
    });
  }

  return disclaimer;
}

async function getSourceConfigs(prisma) {
  const db = await resolvePrismaClient(prisma);

  return db.sourceConfig.findMany({
    orderBy: [{ priority: "asc" }, { sourceType: "asc" }],
    select: {
      allowedDomainsJson: true,
      isEnabled: true,
      name: true,
      notes: true,
      priority: true,
      sourceType: true,
    },
  });
}

async function resolveFixtureResearchPayload(request, prisma) {
  const equipmentIdentity = createCanonicalEquipmentIdentity(request.equipmentName);
  const fixture = getFixtureByNormalizedEquipmentName(equipmentIdentity.normalizedName);

  if (!fixture) {
    throw new AiCompositionError(
      `Research fixtures are only available for "microscope" in this phase. "${request.equipmentName}" is not supported yet.`,
      {
        status: "fixture_not_available",
        statusCode: 422,
      },
    );
  }

  const sourceConfigs = await getSourceConfigs(prisma);
  const researchPayload = buildVerifiedResearchPayload(
    {
      ...fixture.researchInput,
      equipment: {
        aliases: fixture.researchInput.aliases || [],
        name: request.equipmentName,
      },
      equipmentName: request.equipmentName,
      locale: request.locale,
      sourceConfigs,
    },
    {
      now: new Date(),
    },
  );

  if (!researchPayload.verification.isValid) {
    throw new AiCompositionError("The baseline research payload failed verification.", {
      status: "invalid_research_payload",
      statusCode: 500,
    });
  }

  return {
    fixture,
    researchPayload,
  };
}

async function buildUniqueEquipmentSlug(tx, baseSlug, equipmentId) {
  const rootSlug = baseSlug || "equipment";
  let slug = rootSlug;
  let suffix = 2;

  while (true) {
    const existingRecord = await tx.equipment.findFirst({
      where: {
        slug,
        ...(equipmentId
          ? {
              NOT: {
                id: equipmentId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existingRecord) {
      return slug;
    }

    slug = `${rootSlug}-${suffix}`;
    suffix += 1;
  }
}

async function buildUniquePostSlug(tx, baseSlug, postId) {
  const rootSlug = baseSlug || "draft";
  let slug = rootSlug;
  let suffix = 2;

  while (true) {
    const existingRecord = await tx.post.findFirst({
      where: {
        slug,
        ...(postId
          ? {
              NOT: {
                id: postId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existingRecord) {
      return slug;
    }

    slug = `${rootSlug}-${suffix}`;
    suffix += 1;
  }
}

async function upsertEquipmentRecord(tx, researchPayload) {
  const existingEquipment = await tx.equipment.findUnique({
    where: {
      normalizedName: researchPayload.equipment.normalizedName,
    },
    select: {
      id: true,
      slug: true,
    },
  });
  const equipmentSlug = await buildUniqueEquipmentSlug(
    tx,
    researchPayload.equipment.slug,
    existingEquipment?.id,
  );

  return tx.equipment.upsert({
    where: {
      normalizedName: researchPayload.equipment.normalizedName,
    },
    update: {
      description: researchPayload.definition?.summary || null,
      name: researchPayload.equipment.name,
      slug: existingEquipment?.slug || equipmentSlug,
    },
    create: {
      description: researchPayload.definition?.summary || null,
      name: researchPayload.equipment.name,
      normalizedName: researchPayload.equipment.normalizedName,
      slug: equipmentSlug,
    },
  });
}

async function syncManufacturerAliases(tx, manufacturerId, aliases) {
  const existingAliases = await tx.manufacturerAlias.findMany({
    where: {
      manufacturerId,
    },
    select: {
      normalizedAlias: true,
    },
  });
  const existingAliasSet = new Set(existingAliases.map((alias) => alias.normalizedAlias));

  for (const alias of aliases) {
    const normalizedAlias = alias.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");

    if (!normalizedAlias || existingAliasSet.has(normalizedAlias)) {
      continue;
    }

    await tx.manufacturerAlias.create({
      data: {
        alias,
        manufacturerId,
        normalizedAlias,
      },
    });
  }
}

async function upsertManufacturersAndModels(tx, equipmentId, postId, researchPayload) {
  await tx.postManufacturer.deleteMany({
    where: {
      postId,
    },
  });

  for (const manufacturer of researchPayload.manufacturers) {
    const persistedManufacturer = await tx.manufacturer.upsert({
      where: {
        normalizedName_primaryDomain: {
          normalizedName: manufacturer.normalizedName,
          primaryDomain: manufacturer.primaryDomain,
        },
      },
      update: {
        branchCountriesJson: manufacturer.branchCountries?.length ? manufacturer.branchCountries : null,
        headquartersCountry: manufacturer.headquartersCountry || null,
        name: manufacturer.name,
        rankingScore: manufacturer.rankingScore,
        slug: manufacturer.slug,
      },
      create: {
        branchCountriesJson: manufacturer.branchCountries?.length ? manufacturer.branchCountries : null,
        headquartersCountry: manufacturer.headquartersCountry || null,
        name: manufacturer.name,
        normalizedName: manufacturer.normalizedName,
        primaryDomain: manufacturer.primaryDomain,
        rankingScore: manufacturer.rankingScore,
        slug: manufacturer.slug,
      },
    });

    await syncManufacturerAliases(tx, persistedManufacturer.id, manufacturer.aliases);
    await tx.postManufacturer.create({
      data: {
        manufacturerId: persistedManufacturer.id,
        postId,
      },
    });

    for (const model of manufacturer.models || []) {
      await tx.model.upsert({
        where: {
          manufacturerId_slug: {
            manufacturerId: persistedManufacturer.id,
            slug: model.slug,
          },
        },
        update: {
          equipmentId,
          latestKnownYear: model.latestKnownYear,
          name: model.name,
          normalizedName: model.normalizedName,
          rankingScore: model.rankingScore,
          summary: model.summary || null,
        },
        create: {
          equipmentId,
          latestKnownYear: model.latestKnownYear,
          manufacturerId: persistedManufacturer.id,
          name: model.name,
          normalizedName: model.normalizedName,
          rankingScore: model.rankingScore,
          slug: model.slug,
          summary: model.summary || null,
        },
      });
    }
  }
}

async function syncPostStructuredRecords(tx, postId, article) {
  await tx.fault.deleteMany({
    where: {
      postId,
    },
  });
  await tx.maintenanceTask.deleteMany({
    where: {
      postId,
    },
  });

  for (const fault of article.structuredBlocks.faults || []) {
    await tx.fault.create({
      data: {
        cause: fault.cause || "",
        evidenceCount: fault.evidenceCount || 0,
        normalizedTitle: fault.normalizedTitle,
        postId,
        remedy: fault.remedy || "",
        severity: fault.severity,
        sortOrder: fault.sortOrder || 0,
        symptoms: fault.symptoms || "",
        title: fault.title,
      },
    });
  }

  for (const [index, task] of (article.structuredBlocks.maintenanceTasks || []).entries()) {
    await tx.maintenanceTask.create({
      data: {
        description: task.details || "",
        frequency: task.frequency || "Scheduled",
        postId,
        sortOrder: index + 1,
        title: task.label,
      },
    });
  }
}

async function syncSourceReferences(tx, postId, equipmentId, researchPayload) {
  await tx.sourceReference.deleteMany({
    where: {
      postId,
    },
  });

  for (const reference of researchPayload.sourceReferences) {
    await tx.sourceReference.create({
      data: {
        accessStatus: reference.accessStatus || null,
        equipmentId,
        excerpt: reference.excerpt || null,
        fileType: reference.fileType || null,
        language: reference.language || null,
        lastCheckedAt: reference.lastCheckedAt ? new Date(reference.lastCheckedAt) : null,
        notes: reference.notes || null,
        postId,
        reliabilityTier: reference.reliabilityTier || null,
        sourceDomain: reference.sourceDomain,
        sourceType: reference.sourceType,
        title: reference.title,
        url: reference.url,
      },
    });
  }
}

function createDuplicateDecisionSnapshot(duplicateCheck) {
  return {
    canonicalEquipment: duplicateCheck.canonicalEquipment,
    duplicateDetected: duplicateCheck.duplicateDetected,
    duplicateMatch: duplicateCheck.duplicateMatch,
    equipment: duplicateCheck.equipment,
    locale: duplicateCheck.locale,
    matchCount: duplicateCheck.matchCount,
  };
}

function createDuplicateBlockedWarning(request, duplicateCheck) {
  const duplicateSlug = duplicateCheck.duplicateMatch?.slug || "existing-post";

  return `Duplicate detection blocked generation for "${request.equipmentName}" in locale "${request.locale}". Existing post slug: ${duplicateSlug}.`;
}

function createDraftPreviewPayload({
  article,
  duplicateCheck,
  persistedDraft,
  providerConfig,
  providerExecutionMode,
  promptBundle,
  request,
  seoPayload,
  warnings,
}) {
  return {
    article: {
      contentHtml: article.contentHtml,
      contentMd: article.contentMd,
      disclaimer: article.disclaimer,
      excerpt: article.excerpt,
      faqJson: article.faq,
      sections: article.sections,
      structuredBlocks: article.structuredBlocks,
      structuredContentJson: article.structuredContentJson,
      title: article.title,
    },
    duplicateCheck: createDuplicateDecisionSnapshot(duplicateCheck),
    editorialStage: persistedDraft.editorialStage,
    locale: request.locale,
    post: {
      id: persistedDraft.postId,
      schedulePublishAt: request.schedulePublishAt,
      translationId: persistedDraft.translationId,
    },
    promptBundle,
    providerConfig: {
      id: providerConfig.id,
      model: providerConfig.model,
      provider: providerConfig.provider,
      purpose: providerConfig.purpose,
    },
    providerExecutionMode,
    seoPayload,
    warnings,
  };
}

async function recordDuplicateBlockedAuditEvent(
  { actorId, duplicateCheck, jobId, request },
  prisma,
) {
  if (!actorId || !duplicateCheck.duplicateMatch) {
    return;
  }

  const db = await resolvePrismaClient(prisma);

  await db.auditEvent.create({
    data: {
      action: "POST_GENERATION_DUPLICATE_BLOCKED",
      actorId,
      entityId: jobId,
      entityType: "generation_job",
      payloadJson: {
        duplicateCheck: createDuplicateDecisionSnapshot(duplicateCheck),
        locale: request.locale,
        replaceExistingPost: false,
      },
    },
  });
}

async function persistDraftPackage({ actorId, article, request, researchPayload, seoPayload }, prisma) {
  const db = await resolvePrismaClient(prisma);
  const editorialStage = "GENERATED";

  return db.$transaction(async (tx) => {
    const equipment = await upsertEquipmentRecord(tx, researchPayload);
    const duplicateCheck = await detectDuplicateEquipmentPost(
      {
        equipmentId: equipment.id,
        equipmentName: researchPayload.equipment.name,
        locale: request.locale,
      },
      tx,
    );
    const duplicatePost = duplicateCheck.duplicateMatch;

    if (duplicatePost && !request.replaceExistingPost) {
      throw new AiCompositionError(
        `A non-archived ${request.locale} post already exists for "${request.equipmentName}". Choose replace to update it or cancel to keep the current post unchanged.`,
        {
          details: {
            duplicateCheck: createDuplicateDecisionSnapshot(duplicateCheck),
            duplicateDecision: "replace_required",
          },
          status: "duplicate_post_detected",
          statusCode: 409,
        },
      );
    }

    const canonicalPostSlug = await buildUniquePostSlug(
      tx,
      researchPayload.equipment.slug,
      duplicatePost?.postId,
    );
    const post = duplicatePost
      ? await tx.post.update({
          where: {
            id: duplicatePost.postId,
          },
          data: {
            authorId: actorId,
            editorialStage,
            excerpt: article.excerpt,
            slug: duplicatePost.slug,
            status: PostStatus.DRAFT,
          },
        })
      : await tx.post.create({
          data: {
            authorId: actorId,
            editorialStage,
            equipmentId: equipment.id,
            excerpt: article.excerpt,
            slug: canonicalPostSlug,
            status: PostStatus.DRAFT,
          },
        });

    const translation = await tx.postTranslation.upsert({
      where: {
        postId_locale: {
          locale: request.locale,
          postId: post.id,
        },
      },
      update: {
        contentHtml: article.contentHtml,
        contentMd: article.contentMd,
        disclaimer: article.disclaimer,
        excerpt: article.excerpt,
        faqJson: toSerializableJson(article.faq),
        isAutoTranslated: false,
        structuredContentJson: toSerializableJson(article.structuredContentJson),
        title: article.title,
      },
      create: {
        contentHtml: article.contentHtml,
        contentMd: article.contentMd,
        disclaimer: article.disclaimer,
        excerpt: article.excerpt,
        faqJson: toSerializableJson(article.faq),
        isAutoTranslated: false,
        locale: request.locale,
        postId: post.id,
        structuredContentJson: toSerializableJson(article.structuredContentJson),
        title: article.title,
      },
    });

    await tx.seoRecord.upsert({
      where: {
        postTranslationId: translation.id,
      },
      update: {
        authorsJson: toSerializableJson(seoPayload.authors),
        canonicalUrl: seoPayload.canonicalUrl,
        keywordsJson: toSerializableJson(seoPayload.keywords),
        metaDescription: seoPayload.metaDescription,
        metaTitle: seoPayload.metaTitle,
        noindex: seoPayload.noindex,
        ogDescription: seoPayload.ogDescription,
        ogImageId: seoPayload.ogImageId,
        ogTitle: seoPayload.ogTitle,
        twitterDescription: seoPayload.twitterDescription,
        twitterTitle: seoPayload.twitterTitle,
      },
      create: {
        authorsJson: toSerializableJson(seoPayload.authors),
        canonicalUrl: seoPayload.canonicalUrl,
        keywordsJson: toSerializableJson(seoPayload.keywords),
        metaDescription: seoPayload.metaDescription,
        metaTitle: seoPayload.metaTitle,
        noindex: seoPayload.noindex,
        ogDescription: seoPayload.ogDescription,
        ogImageId: seoPayload.ogImageId,
        ogTitle: seoPayload.ogTitle,
        postTranslationId: translation.id,
        twitterDescription: seoPayload.twitterDescription,
        twitterTitle: seoPayload.twitterTitle,
      },
    });

    await syncPostStructuredRecords(tx, post.id, article);
    await upsertManufacturersAndModels(tx, equipment.id, post.id, researchPayload);
    await syncSourceReferences(tx, post.id, equipment.id, researchPayload);

    if (duplicatePost && request.replaceExistingPost) {
      await tx.auditEvent.create({
        data: {
          action: "POST_DUPLICATE_REPLACED",
          actorId,
          entityId: post.id,
          entityType: "post",
          payloadJson: {
            duplicateCheck: createDuplicateDecisionSnapshot(duplicateCheck),
            locale: request.locale,
            providerConfigId: request.providerConfigId,
            slug: post.slug,
          },
        },
      });
    }

    await tx.auditEvent.create({
      data: {
        action: "POST_GENERATED",
        actorId,
        entityId: post.id,
        entityType: "post",
        payloadJson: {
          locale: request.locale,
          providerConfigId: request.providerConfigId,
          slug: post.slug,
        },
      },
    });

    return {
      editorialStage,
      postId: post.id,
      translationId: translation.id,
    };
  });
}

export async function composeDraftPackage(input, options = {}, prisma) {
  const providerConfig =
    options.providerConfig || (await resolveProviderConfig(input.providerConfigId, prisma));
  const promptLayers = options.promptLayers || (await loadActivePromptLayers(prisma));
  const disclaimer = options.disclaimer || (await getDefaultDisclaimer(input.locale));
  const fixtureResolution =
    options.fixtureResolution || (await resolveFixtureResearchPayload(input, prisma));
  const preCompositionPromptBundle = buildPromptBundle({
    disclaimer,
    promptLayers,
    request: input,
    researchPayload: fixtureResolution.researchPayload,
  });
  const provider = createProvider(providerConfig, options.providerOptions);
  const providerResult = await provider.composeStructuredArticle({
    disclaimer,
    fixture: fixtureResolution.fixture,
    promptBundle: preCompositionPromptBundle,
    providerConfig,
    request: input,
    researchPayload: fixtureResolution.researchPayload,
  });
  const structuredArticle = providerResult.structuredArticle;

  validateStructuredArticle(structuredArticle);

  const promptBundle = buildPromptBundle({
    article: structuredArticle,
    disclaimer,
    promptLayers,
    request: input,
    researchPayload: fixtureResolution.researchPayload,
  });

  const markdown = buildMarkdownFromStructuredArticle(structuredArticle);
  const html = buildHtmlFromStructuredArticle(structuredArticle);
  const articleWithArtifacts = {
    ...structuredArticle,
    contentHtml: html,
    contentMd: markdown,
    faq: structuredArticle.faq,
    structuredContentJson: {
      promptBundle,
      provider: {
        executionMode: providerResult.executionMode,
        model: provider.model,
        name: provider.name,
      },
      renderArtifacts: {
        html: true,
        markdown: true,
      },
      sections: structuredArticle.sections,
      structuredBlocks: structuredArticle.structuredBlocks,
      warnings: fixtureResolution.researchPayload.reliabilityWarnings,
    },
  };
  const seoPayload = buildSeoPayload(articleWithArtifacts, {
    locale: input.locale,
  });

  return {
    article: articleWithArtifacts,
    promptBundle,
    providerConfig,
    providerExecutionMode: providerResult.executionMode,
    researchPayload: fixtureResolution.researchPayload,
    seoPayload,
    warnings: dedupeStrings([
      ...fixtureResolution.researchPayload.reliabilityWarnings,
      'The current composition path uses the microscope acceptance fixture until live source collection is expanded in a later step.',
    ]),
  };
}

export async function generateDraftFromRequest(input, options = {}, prisma) {
  const {
    cancelGenerationJob,
    completeGenerationJob,
    createGenerationJobRecord,
    failGenerationJob,
    markGenerationJobRunning,
  } = await import("@/lib/jobs");
  const providerConfig = await resolveProviderConfig(input.providerConfigId, prisma);
  const duplicateCheck = await detectDuplicateEquipmentPost(
    {
      equipmentName: input.equipmentName,
      locale: input.locale,
    },
    prisma,
  );
  const job = await createGenerationJobRecord(
    {
      currentStage: generationStageOrder[0],
      equipmentName: input.equipmentName,
      locale: input.locale,
      providerConfigId: providerConfig.id,
      replaceExistingPost: input.replaceExistingPost,
      requestJson: input,
      schedulePublishAt: input.schedulePublishAt ? new Date(input.schedulePublishAt) : null,
      status: "PENDING",
    },
    prisma,
  );
  let jobFinalized = false;

  try {
    await markGenerationJobRunning(job.id, generationStageOrder[0], prisma);

    if (duplicateCheck.duplicateDetected && !input.replaceExistingPost) {
      const duplicateDecision = createDuplicateDecisionSnapshot(duplicateCheck);
      const blockedWarning = createDuplicateBlockedWarning(input, duplicateCheck);

      await cancelGenerationJob(
        job.id,
        {
          currentStage: generationTerminalStageIds.duplicateCheckBlocked,
          postId: duplicateCheck.duplicateMatch?.postId || null,
          responseJson: {
            duplicateCheck: duplicateDecision,
            duplicateDecision: "replace_required",
          },
          warningJson: [blockedWarning],
        },
        prisma,
      );
      jobFinalized = true;

      await recordDuplicateBlockedAuditEvent(
        {
          actorId: options.actorId,
          duplicateCheck,
          jobId: job.id,
          request: input,
        },
        prisma,
      );

      throw new AiCompositionError(
        `A non-archived ${input.locale} post already exists for "${input.equipmentName}". Choose replace to update it or cancel to keep the current post unchanged.`,
        {
          details: {
            duplicateCheck: duplicateDecision,
            duplicateDecision: "replace_required",
            jobId: job.id,
          },
          status: "duplicate_post_detected",
          statusCode: 409,
        },
      );
    }

    await markGenerationJobRunning(job.id, generationStageOrder[1], prisma);

    const composed = await composeDraftPackage(
      input,
      {
        ...options,
        providerConfig,
      },
      prisma,
    );

    await markGenerationJobRunning(job.id, generationStageOrder[2], prisma);

    const persistedDraft = await persistDraftPackage(
      {
        actorId: options.actorId,
        article: composed.article,
        request: input,
        researchPayload: composed.researchPayload,
        seoPayload: composed.seoPayload,
      },
      prisma,
    );

    await completeGenerationJob(
      job.id,
      {
        currentStage: generationStageOrder[3],
        postId: persistedDraft.postId,
        responseJson: {
          duplicateCheck: createDuplicateDecisionSnapshot(duplicateCheck),
          duplicateDecision: duplicateCheck.duplicateDetected ? "replace_existing" : "create_new",
          promptBundle: composed.promptBundle,
          providerExecutionMode: composed.providerExecutionMode,
          seoPayload: composed.seoPayload,
          structuredContentJson: composed.article.structuredContentJson,
        },
        warningJson: composed.warnings,
      },
      prisma,
    );

    return {
      editorialStage: persistedDraft.editorialStage,
      jobId: job.id,
      postId: persistedDraft.postId,
      status: "draft_saved",
      success: true,
      preview: createDraftPreviewPayload({
        article: composed.article,
        duplicateCheck,
        persistedDraft,
        providerConfig,
        providerExecutionMode: composed.providerExecutionMode,
        promptBundle: composed.promptBundle,
        request: input,
        seoPayload: composed.seoPayload,
        warnings: composed.warnings,
      }),
      warnings: composed.warnings,
    };
  } catch (error) {
    if (!jobFinalized) {
      await failGenerationJob(
        job.id,
        error,
        {
          currentStage: generationTerminalStageIds.failed,
        },
        prisma,
      ).catch(() => {});
    }
    throw error;
  }
}

export function createAiCompositionErrorPayload(error) {
  if (error instanceof AiCompositionError) {
    return {
      body: {
        details: error.details || undefined,
        message: error.message,
        status: error.status,
        success: false,
      },
      statusCode: error.statusCode,
    };
  }

  console.error(error);

  return {
    body: {
      message: "An unexpected draft generation error occurred.",
      status: "internal_error",
      success: false,
    },
    statusCode: 500,
  };
}
