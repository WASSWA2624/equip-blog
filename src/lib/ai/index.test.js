import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createBaseEnv() {
  return {
    DATABASE_URL: "mysql://user:password@localhost:3306/med_blog",
    NEXT_PUBLIC_APP_URL: "https://example.com",
    DEFAULT_LOCALE: "en",
    SUPPORTED_LOCALES: "en",
    SESSION_SECRET: "change-me",
    SESSION_MAX_AGE_SECONDS: "28800",
    AI_PROVIDER_DEFAULT: "openai",
    AI_MODEL_DEFAULT: "gpt-5.4",
    AI_PROVIDER_FALLBACK: "openai",
    AI_MODEL_FALLBACK: "gpt-5.4-mini",
    OPENAI_API_KEY: "test-openai-key",
    MEDIA_DRIVER: "local",
    LOCAL_MEDIA_BASE_PATH: "public/uploads",
    LOCAL_MEDIA_BASE_URL: "/uploads",
    S3_MEDIA_BUCKET: "",
    S3_MEDIA_REGION: "",
    S3_MEDIA_BASE_URL: "",
    S3_ACCESS_KEY_ID: "",
    S3_SECRET_ACCESS_KEY: "",
    ADMIN_SEED_EMAIL: "admin@example.com",
    ADMIN_SEED_PASSWORD: "strong-password",
    COMMENT_RATE_LIMIT_WINDOW_MS: "60000",
    COMMENT_RATE_LIMIT_MAX: "5",
    COMMENT_CAPTCHA_ENABLED: "false",
    COMMENT_CAPTCHA_SECRET: "",
    UPLOAD_ALLOWED_MIME_TYPES: "image/jpeg,image/png,image/webp",
    REVALIDATE_SECRET: "change-me",
    CRON_SECRET: "change-me",
  };
}

function createPromptLayers() {
  return [
    {
      id: "prompt_system",
      isActive: true,
      name: "System",
      purpose: "system_instruction",
      systemPrompt: "Write educational equipment guides.",
      userPromptTemplate: "Generate a guide for {{equipmentName}}.",
      version: 1,
    },
    {
      id: "prompt_grounding",
      isActive: true,
      name: "Grounding",
      purpose: "data_grounding",
      systemPrompt: "Use the research payload as truth.",
      userPromptTemplate: "Research: {{researchPayloadJson}}",
      version: 1,
    },
    {
      id: "prompt_json",
      isActive: true,
      name: "Output structure",
      purpose: "output_json_structure",
      systemPrompt: "Return structured content.",
      userPromptTemplate: "Section order: {{sectionOrderJson}}",
      version: 1,
    },
    {
      id: "prompt_format",
      isActive: true,
      name: "Formatting",
      purpose: "article_formatting",
      systemPrompt: "Format Markdown and HTML.",
      userPromptTemplate: "Article JSON: {{articleJson}}",
      version: 1,
    },
    {
      id: "prompt_safety",
      isActive: true,
      name: "Safety",
      purpose: "safety_boundaries",
      systemPrompt: "Preserve disclaimer and warnings.",
      userPromptTemplate: "Disclaimer: {{disclaimer}}",
      version: 1,
    },
  ];
}

const originalEnv = process.env;

describe("AI composition pipeline", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      ...createBaseEnv(),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("loads the latest active prompt layers in the required order", async () => {
    const prisma = {
      promptTemplate: {
        findMany: vi.fn().mockResolvedValue([
          ...createPromptLayers(),
          {
            id: "prompt_system_v2",
            isActive: true,
            name: "System v2",
            purpose: "system_instruction",
            systemPrompt: "Write stronger educational guides.",
            userPromptTemplate: "Generate a richer guide for {{equipmentName}}.",
            version: 2,
          },
        ]),
      },
    };
    const { loadActivePromptLayers, promptTemplatePurposeOrder } = await import("./index");

    const layers = await loadActivePromptLayers(prisma);

    expect(layers.map((layer) => layer.purpose)).toEqual(promptTemplatePurposeOrder);
    expect(layers[0]).toMatchObject({
      id: "prompt_system_v2",
      version: 2,
    });
  });

  it("builds a compliant microscope draft package with disclaimer and references preserved", async () => {
    const prisma = {
      sourceConfig: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };
    const { composeDraftPackage, generatedArticleSectionOrder } = await import("./index");

    const draft = await composeDraftPackage(
      {
        articleDepth: "complete",
        equipmentName: "Microscope",
        includeFaults: true,
        includeImages: true,
        includeManualLinks: true,
        includeManufacturers: true,
        includeModels: true,
        locale: "en",
        providerConfigId: "provider_cfg_default_generation",
        replaceExistingPost: false,
        schedulePublishAt: null,
        targetAudience: ["students", "technicians", "biomedical_staff"],
      },
      {
        disclaimer: "English disclaimer",
        promptLayers: createPromptLayers(),
        providerConfig: {
          id: "provider_cfg_default_generation",
          model: "gpt-5.4",
          provider: "openai",
        },
      },
      prisma,
    );

    const sectionIds = draft.article.sections.map((section) => section.id);

    expect(sectionIds).toEqual(
      generatedArticleSectionOrder.filter((sectionId) => sectionIds.includes(sectionId)),
    );
    expect(draft.article.sections.find((section) => section.id === "references")?.items.length).toBeGreaterThan(0);
    expect(draft.article.sections.find((section) => section.id === "disclaimer")?.paragraphs).toEqual([
      "English disclaimer",
    ]);
    expect(draft.article.contentMd).toContain("# Microscope");
    expect(draft.article.contentHtml).toContain("<article>");
    expect(draft.seoPayload.canonicalUrl).toContain("/en/blog/microscope");
  });

  it("persists the microscope acceptance draft, seo payload, structured blocks, and generation job", async () => {
    const generationJobCreate = vi.fn().mockResolvedValue({
      id: "job_1",
    });
    const generationJobUpdate = vi.fn().mockResolvedValue(null);
    const tx = {
      auditEvent: {
        create: vi.fn().mockResolvedValue(null),
      },
      equipment: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({
          id: "equipment_1",
          slug: "microscope",
        }),
      },
      fault: {
        create: vi.fn().mockResolvedValue(null),
        deleteMany: vi.fn().mockResolvedValue(null),
      },
      maintenanceTask: {
        create: vi.fn().mockResolvedValue(null),
        deleteMany: vi.fn().mockResolvedValue(null),
      },
      manufacturer: {
        upsert: vi
          .fn()
          .mockResolvedValueOnce({ id: "manufacturer_1" })
          .mockResolvedValueOnce({ id: "manufacturer_2" })
          .mockResolvedValueOnce({ id: "manufacturer_3" }),
      },
      manufacturerAlias: {
        create: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
      model: {
        upsert: vi.fn().mockResolvedValue(null),
      },
      post: {
        create: vi.fn().mockResolvedValue({
          id: "post_1",
          slug: "microscope",
        }),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({
          id: "post_1",
          slug: "microscope",
        }),
      },
      postManufacturer: {
        create: vi.fn().mockResolvedValue(null),
        deleteMany: vi.fn().mockResolvedValue(null),
      },
      postTranslation: {
        upsert: vi.fn().mockResolvedValue({
          id: "translation_1",
        }),
      },
      seoRecord: {
        upsert: vi.fn().mockResolvedValue(null),
      },
      sourceReference: {
        create: vi.fn().mockResolvedValue(null),
        deleteMany: vi.fn().mockResolvedValue(null),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (callback) => callback(tx)),
      generationJob: {
        create: generationJobCreate,
        update: generationJobUpdate,
      },
      modelProviderConfig: {
        findUnique: vi.fn().mockResolvedValue({
          id: "provider_cfg_default_generation",
          isEnabled: true,
          model: "gpt-5.4",
          provider: "openai",
        }),
      },
      promptTemplate: {
        findMany: vi.fn().mockResolvedValue(createPromptLayers()),
      },
      sourceConfig: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };
    const { generateDraftFromRequest } = await import("./index");

    const result = await generateDraftFromRequest(
      {
        articleDepth: "complete",
        equipmentName: "Microscope",
        includeFaults: true,
        includeImages: true,
        includeManualLinks: true,
        includeManufacturers: true,
        includeModels: true,
        locale: "en",
        providerConfigId: "provider_cfg_default_generation",
        replaceExistingPost: false,
        schedulePublishAt: null,
        targetAudience: ["students", "technicians", "biomedical_staff"],
      },
      {
        actorId: "user_1",
      },
      prisma,
    );

    expect(result).toMatchObject({
      editorialStage: "GENERATED",
      jobId: "job_1",
      postId: "post_1",
      status: "draft_saved",
      success: true,
    });
    expect(generationJobCreate).toHaveBeenCalledTimes(1);
    expect(generationJobUpdate).toHaveBeenCalled();
    expect(tx.postTranslation.upsert).toHaveBeenCalledTimes(1);
    expect(tx.seoRecord.upsert).toHaveBeenCalledTimes(1);
    expect(tx.fault.create).toHaveBeenCalled();
    expect(tx.maintenanceTask.create).toHaveBeenCalled();
    expect(tx.sourceReference.create).toHaveBeenCalled();
  });
});
