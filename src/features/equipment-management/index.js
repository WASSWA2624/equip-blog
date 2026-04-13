import { EditorialStage, PostStatus } from "@prisma/client";

import { defaultLocale } from "@/features/i18n/config";
import { getMessages } from "@/features/i18n/get-messages";
import { buildLocalizedPath, publicRouteSegments } from "@/features/i18n/routing";
import { emptyStructuredContent } from "@/features/posts/localized-content";
import { generateDraftFromRequest } from "@/lib/ai";
import { createProviderConfigSummary } from "@/lib/ai/provider-configs";
import {
  equipmentLifecycleStatusValues,
  updateEquipmentLifecycleStatus,
} from "@/lib/equipment/lifecycle";
import { createSlug, normalizeDisplayText } from "@/lib/normalization";
import { generationRequestDefaults } from "@/lib/validation";

export const equipmentManagementPageSize = 50;

const equipmentLifecycleFilterValues = Object.freeze(["all", ...equipmentLifecycleStatusValues.map((value) => value.toLowerCase())]);

export class EquipmentManagementError extends Error {
  constructor(message, { status = "invalid_equipment_management", statusCode = 400 } = {}) {
    super(message);
    this.name = "EquipmentManagementError";
    this.status = status;
    this.statusCode = statusCode;
  }
}

function assertActorId(actorId, action) {
  if (typeof actorId === "string" && actorId.trim()) {
    return actorId;
  }

  throw new EquipmentManagementError(`A signed-in admin actor is required to ${action}.`, {
    status: "admin_actor_required",
    statusCode: 400,
  });
}

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : null;
}

function normalizePositiveInteger(value, fallback = 1, { max = 100 } = {}) {
  const parsedValue = Number.parseInt(`${value ?? ""}`.trim(), 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.min(parsedValue, max);
}

function normalizeSearchValue(value) {
  return normalizeDisplayText(value).slice(0, 191);
}

function normalizeLifecycleFilter(value) {
  const normalizedValue = `${value || "all"}`.trim().toLowerCase();

  return equipmentLifecycleFilterValues.includes(normalizedValue) ? normalizedValue : "all";
}

function createPagination(totalItems, currentPage, pageSize) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const resolvedCurrentPage = Math.min(currentPage, totalPages);

  if (!totalItems) {
    return {
      currentPage: 1,
      endItem: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      pageSize,
      startItem: 0,
      totalItems: 0,
      totalPages: 1,
    };
  }

  return {
    currentPage: resolvedCurrentPage,
    endItem: Math.min(totalItems, resolvedCurrentPage * pageSize),
    hasNextPage: resolvedCurrentPage < totalPages,
    hasPreviousPage: resolvedCurrentPage > 1,
    pageSize,
    startItem: (resolvedCurrentPage - 1) * pageSize + 1,
    totalItems,
    totalPages,
  };
}

async function resolvePrismaClient(prisma) {
  if (prisma) {
    return prisma;
  }

  const { getPrismaClient } = await import("@/lib/prisma");

  return getPrismaClient();
}

function createEquipmentWhereClause({ lifecycleStatus, search }) {
  const normalizedSearch = normalizeSearchValue(search);
  const normalizedLifecycleFilter = normalizeLifecycleFilter(lifecycleStatus);
  const where = {
    ...(normalizedLifecycleFilter !== "all"
      ? {
          lifecycleStatus: normalizedLifecycleFilter.toUpperCase(),
        }
      : {}),
  };

  if (!normalizedSearch) {
    return where;
  }

  return {
    ...where,
    OR: [
      {
        name: {
          contains: normalizedSearch,
        },
      },
      {
        normalizedName: {
          contains: normalizedSearch,
        },
      },
      {
        slug: {
          contains: normalizedSearch,
        },
      },
      {
        posts: {
          some: {
            translations: {
              some: {
                locale: defaultLocale,
                title: {
                  contains: normalizedSearch,
                },
              },
            },
          },
        },
      },
    ],
  };
}

function buildEquipmentListOrderBy() {
  return [{ lifecycleStatus: "asc" }, { name: "asc" }, { updatedAt: "desc" }];
}

function createEquipmentPostSummary(post, locale, equipmentName) {
  if (!post) {
    return null;
  }

  const translation = post.translations?.[0] || null;

  return {
    editorialStage: post.editorialStage,
    editorPath: `/admin/posts/${post.id}`,
    id: post.id,
    locale,
    publicPath: buildLocalizedPath(locale, publicRouteSegments.blogPost(post.slug)),
    publishedAt: serializeDate(post.publishedAt),
    scheduledPublishAt: serializeDate(post.scheduledPublishAt),
    slug: post.slug,
    status: post.status,
    title: translation?.title || equipmentName,
    updatedAt: serializeDate(post.updatedAt),
  };
}

function createEquipmentRecordSummary(equipment, locale) {
  const primaryPost = equipment.posts?.[0] || null;

  return {
    id: equipment.id,
    lifecycleNotes: equipment.lifecycleNotes || null,
    lifecycleStatus: equipment.lifecycleStatus,
    name: equipment.name,
    normalizedName: equipment.normalizedName,
    postCount: equipment._count.posts,
    postedAt: serializeDate(equipment.postedAt),
    primaryPost: createEquipmentPostSummary(primaryPost, locale, equipment.name),
    slug: equipment.slug,
    updatedAt: serializeDate(equipment.updatedAt),
  };
}

async function getDefaultGenerationProviderConfigRecord(db) {
  return db.modelProviderConfig.findFirst({
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }, { provider: "asc" }, { model: "asc" }],
    select: {
      apiKeyEncrypted: true,
      apiKeyEnvName: true,
      apiKeyLast4: true,
      apiKeyUpdatedAt: true,
      id: true,
      isDefault: true,
      isEnabled: true,
      model: true,
      provider: true,
      purpose: true,
      updatedAt: true,
    },
    where: {
      isEnabled: true,
      purpose: "draft_generation",
    },
  });
}

async function getEquipmentRecordById(db, equipmentId) {
  const equipment = await db.equipment.findUnique({
    where: {
      id: equipmentId,
    },
    select: {
      _count: {
        select: {
          posts: true,
        },
      },
      id: true,
      lifecycleNotes: true,
      lifecycleStatus: true,
      name: true,
      normalizedName: true,
      postedAt: true,
      posts: {
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { slug: "asc" }],
        select: {
          editorialStage: true,
          id: true,
          publishedAt: true,
          scheduledPublishAt: true,
          slug: true,
          status: true,
          translations: {
            orderBy: {
              updatedAt: "desc",
            },
            select: {
              title: true,
            },
            take: 1,
            where: {
              locale: defaultLocale,
            },
          },
          updatedAt: true,
        },
        take: 1,
      },
      slug: true,
      updatedAt: true,
    },
  });

  if (!equipment) {
    throw new EquipmentManagementError(`Equipment "${equipmentId}" was not found.`, {
      status: "equipment_not_found",
      statusCode: 404,
    });
  }

  return equipment;
}

async function buildUniquePostSlug(tx, baseSlug, existingPostId = null) {
  const rootSlug = baseSlug || "draft";
  let nextSlug = rootSlug;
  let suffix = 2;

  while (true) {
    const existingPost = await tx.post.findFirst({
      where: {
        slug: nextSlug,
        ...(existingPostId
          ? {
              NOT: {
                id: existingPostId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existingPost) {
      return nextSlug;
    }

    nextSlug = `${rootSlug}-${suffix}`;
    suffix += 1;
  }
}

async function getDefaultDisclaimer(locale) {
  const messages = await getMessages(locale);
  const disclaimer = messages.post?.defaultDisclaimer;

  if (typeof disclaimer !== "string" || !disclaimer.trim()) {
    throw new EquipmentManagementError(`Locale "${locale}" is missing post.defaultDisclaimer.`, {
      status: "missing_default_disclaimer",
      statusCode: 500,
    });
  }

  return disclaimer;
}

function createManualDraftExcerpt(equipmentName) {
  return `${equipmentName} draft prepared for manual editorial development.`;
}

export async function getEquipmentManagementSnapshot(
  { lifecycleStatus = "all", locale = defaultLocale, page = 1, pageSize = equipmentManagementPageSize, search = "" } = {},
  prisma,
) {
  const db = await resolvePrismaClient(prisma);
  const normalizedPageSize = normalizePositiveInteger(pageSize, equipmentManagementPageSize, { max: 100 });
  const normalizedPage = normalizePositiveInteger(page, 1, { max: 9999 });
  const normalizedLifecycleFilter = normalizeLifecycleFilter(lifecycleStatus);
  const normalizedSearch = normalizeSearchValue(search);
  const where = createEquipmentWhereClause({
    lifecycleStatus: normalizedLifecycleFilter,
    search: normalizedSearch,
  });
  const [
    totalCount,
    matchingCount,
    plannedCount,
    draftCount,
    generatedCount,
    editedCount,
    updatedCount,
    postedCount,
    defaultProviderConfig,
  ] = await Promise.all([
    db.equipment.count(),
    db.equipment.count({ where }),
    db.equipment.count({ where: { lifecycleStatus: "PLANNED" } }),
    db.equipment.count({ where: { lifecycleStatus: "DRAFT" } }),
    db.equipment.count({ where: { lifecycleStatus: "GENERATED" } }),
    db.equipment.count({ where: { lifecycleStatus: "EDITED" } }),
    db.equipment.count({ where: { lifecycleStatus: "UPDATED" } }),
    db.equipment.count({ where: { lifecycleStatus: "POSTED" } }),
    getDefaultGenerationProviderConfigRecord(db),
  ]);
  const pagination = createPagination(matchingCount, normalizedPage, normalizedPageSize);
  const equipmentRecords = matchingCount
    ? await db.equipment.findMany({
        orderBy: buildEquipmentListOrderBy(),
        select: {
          _count: {
            select: {
              posts: true,
            },
          },
          id: true,
          lifecycleNotes: true,
          lifecycleStatus: true,
          name: true,
          normalizedName: true,
          postedAt: true,
          posts: {
            orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { slug: "asc" }],
            select: {
              editorialStage: true,
              id: true,
              publishedAt: true,
              scheduledPublishAt: true,
              slug: true,
              status: true,
              translations: {
                orderBy: {
                  updatedAt: "desc",
                },
                select: {
                  title: true,
                },
                take: 1,
                where: {
                  locale,
                },
              },
              updatedAt: true,
            },
            take: 1,
          },
          slug: true,
          updatedAt: true,
        },
        skip: (pagination.currentPage - 1) * pagination.pageSize,
        take: pagination.pageSize,
        where,
      })
    : [];

  return {
    defaultProviderConfig: defaultProviderConfig ? createProviderConfigSummary(defaultProviderConfig) : null,
    filters: {
      lifecycleStatus: normalizedLifecycleFilter,
      locale,
      page: pagination.currentPage,
      search: normalizedSearch,
    },
    items: equipmentRecords.map((equipment) => createEquipmentRecordSummary(equipment, locale)),
    pagination,
    summary: {
      draftCount,
      editedCount,
      generatedCount,
      matchingCount,
      plannedCount,
      postedCount,
      totalCount,
      updatedCount,
    },
  };
}

export async function getEquipmentDashboardPreview(prisma) {
  const db = await resolvePrismaClient(prisma);

  if (typeof db.equipment?.count !== "function" || typeof db.equipment?.findMany !== "function") {
    return {
      items: [],
      summary: {
        draftCount: 0,
        editedCount: 0,
        generatedCount: 0,
        matchingCount: 0,
        plannedCount: 0,
        postedCount: 0,
        totalCount: 0,
        updatedCount: 0,
      },
    };
  }

  const [totalCount, plannedCount, draftCount, generatedCount, editedCount, updatedCount, postedCount, equipmentRecords] =
    await Promise.all([
      db.equipment.count(),
      db.equipment.count({ where: { lifecycleStatus: "PLANNED" } }),
      db.equipment.count({ where: { lifecycleStatus: "DRAFT" } }),
      db.equipment.count({ where: { lifecycleStatus: "GENERATED" } }),
      db.equipment.count({ where: { lifecycleStatus: "EDITED" } }),
      db.equipment.count({ where: { lifecycleStatus: "UPDATED" } }),
      db.equipment.count({ where: { lifecycleStatus: "POSTED" } }),
      db.equipment.findMany({
        orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
        select: {
          _count: {
            select: {
              posts: true,
            },
          },
          id: true,
          lifecycleNotes: true,
          lifecycleStatus: true,
          name: true,
          normalizedName: true,
          postedAt: true,
          posts: {
            orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { slug: "asc" }],
            select: {
              editorialStage: true,
              id: true,
              publishedAt: true,
              scheduledPublishAt: true,
              slug: true,
              status: true,
              translations: {
                orderBy: {
                  updatedAt: "desc",
                },
                select: {
                  title: true,
                },
                take: 1,
                where: {
                  locale: defaultLocale,
                },
              },
              updatedAt: true,
            },
            take: 1,
          },
          slug: true,
          updatedAt: true,
        },
        take: 8,
      }),
    ]);

  return {
    items: equipmentRecords.map((equipment) => createEquipmentRecordSummary(equipment, defaultLocale)),
    summary: {
      draftCount,
      editedCount,
      generatedCount,
      matchingCount: totalCount,
      plannedCount,
      postedCount,
      totalCount,
      updatedCount,
    },
  };
}

export async function createManualEquipmentDraft(
  { equipmentId, locale = defaultLocale },
  options = {},
  prisma,
) {
  const db = await resolvePrismaClient(prisma);
  const actorId = assertActorId(options.actorId, "create or open a manual equipment draft");
  const disclaimer = await getDefaultDisclaimer(locale);

  return db.$transaction(async (tx) => {
    const equipment = await tx.equipment.findUnique({
      where: {
        id: equipmentId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        posts: {
          orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { slug: "asc" }],
          select: {
            id: true,
            slug: true,
            status: true,
          },
          take: 1,
          where: {
            status: {
              in: [PostStatus.DRAFT, PostStatus.SCHEDULED, PostStatus.PUBLISHED],
            },
          },
        },
      },
    });

    if (!equipment) {
      throw new EquipmentManagementError(`Equipment "${equipmentId}" was not found.`, {
        status: "equipment_not_found",
        statusCode: 404,
      });
    }

    const existingPost = equipment.posts[0] || null;

    if (existingPost) {
      return {
        created: false,
        equipmentId: equipment.id,
        post: {
          editorPath: `/admin/posts/${existingPost.id}`,
          id: existingPost.id,
          publicPath: buildLocalizedPath(locale, publicRouteSegments.blogPost(existingPost.slug)),
          slug: existingPost.slug,
          status: existingPost.status,
        },
      };
    }

    const draftExcerpt = createManualDraftExcerpt(equipment.name);
    const postSlug = await buildUniquePostSlug(tx, createSlug(equipment.slug || equipment.name, "draft"));
    const createdPost = await tx.post.create({
      data: {
        authorId: actorId,
        editorialStage: EditorialStage.GENERATED,
        equipmentId: equipment.id,
        excerpt: draftExcerpt,
        slug: postSlug,
        status: PostStatus.DRAFT,
      },
      select: {
        id: true,
        slug: true,
        status: true,
      },
    });

    await tx.postTranslation.create({
      data: {
        contentHtml: "",
        contentMd: "",
        disclaimer,
        excerpt: draftExcerpt,
        faqJson: [],
        isAutoTranslated: false,
        locale,
        postId: createdPost.id,
        structuredContentJson: {
          ...emptyStructuredContent,
          locale,
        },
        title: equipment.name,
      },
    });
    await updateEquipmentLifecycleStatus(tx, {
      equipmentId: equipment.id,
      status: "DRAFT",
    });

    await tx.auditEvent.create({
      data: {
        action: "EQUIPMENT_MANUAL_DRAFT_CREATED",
        actorId,
        entityId: equipment.id,
        entityType: "equipment",
        payloadJson: {
          locale,
          postId: createdPost.id,
          slug: createdPost.slug,
        },
      },
    });

    return {
      created: true,
      equipmentId: equipment.id,
      post: {
        editorPath: `/admin/posts/${createdPost.id}`,
        id: createdPost.id,
        publicPath: buildLocalizedPath(locale, publicRouteSegments.blogPost(createdPost.slug)),
        slug: createdPost.slug,
        status: createdPost.status,
      },
    };
  });
}

export async function updateManagedEquipmentLifecycle(
  { equipmentId, lifecycleNotes, lifecycleStatus },
  options = {},
  prisma,
) {
  const normalizedStatus = `${lifecycleStatus || ""}`.trim().toUpperCase();

  if (!equipmentLifecycleStatusValues.includes(normalizedStatus)) {
    throw new EquipmentManagementError(`Unsupported equipment lifecycle status "${lifecycleStatus}".`, {
      status: "invalid_equipment_lifecycle_status",
      statusCode: 400,
    });
  }

  const db = await resolvePrismaClient(prisma);

  await db.$transaction(async (tx) => {
    await getEquipmentRecordById(tx, equipmentId);
    await updateEquipmentLifecycleStatus(tx, {
      equipmentId,
      notes: lifecycleNotes,
      status: normalizedStatus,
    });

    if (options.actorId) {
      await tx.auditEvent.create({
        data: {
          action: "EQUIPMENT_LIFECYCLE_UPDATED",
          actorId: options.actorId,
          entityId: equipmentId,
          entityType: "equipment",
          payloadJson: {
            lifecycleNotes: lifecycleNotes || null,
            lifecycleStatus: normalizedStatus,
          },
        },
      });
    }
  });

  return {
    item: createEquipmentRecordSummary(await getEquipmentRecordById(db, equipmentId), defaultLocale),
  };
}

export async function generateEquipmentPost(
  { equipmentId, locale = defaultLocale },
  options = {},
  prisma,
) {
  const db = await resolvePrismaClient(prisma);
  const actorId = assertActorId(options.actorId, "generate an equipment draft");
  const [equipment, defaultProviderConfig] = await Promise.all([
    getEquipmentRecordById(db, equipmentId),
    getDefaultGenerationProviderConfigRecord(db),
  ]);

  if (!defaultProviderConfig) {
    throw new EquipmentManagementError("No enabled default AI provider configuration is available.", {
      status: "provider_config_not_found",
      statusCode: 400,
    });
  }

  const existingPrimaryPost = equipment.posts[0] || null;
  const generationResult = await generateDraftFromRequest(
    {
      ...generationRequestDefaults,
      equipmentName: equipment.name,
      locale,
      providerConfigId: defaultProviderConfig.id,
      replaceExistingPost: Boolean(existingPrimaryPost),
    },
    {
      actorId,
    },
    db,
  );

  return {
    item: createEquipmentRecordSummary(await getEquipmentRecordById(db, equipmentId), locale),
    providerConfig: createProviderConfigSummary(defaultProviderConfig),
    result: generationResult,
  };
}

export function createEquipmentManagementErrorPayload(error) {
  if (error instanceof EquipmentManagementError) {
    return {
      body: {
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
      message: "An unexpected equipment management error occurred.",
      status: "internal_error",
      success: false,
    },
    statusCode: 500,
  };
}
