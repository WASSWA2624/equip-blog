import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createBaseEnv() {
  return {
    ADMIN_SEED_EMAIL: "admin@admin.com",
    ADMIN_SEED_PASSWORD: "admin",
    AI_MODEL_DEFAULT: "gpt-5.4",
    AI_MODEL_FALLBACK: "gpt-5.4-mini",
    AI_PROVIDER_DEFAULT: "openai",
    AI_PROVIDER_FALLBACK: "openai",
    COMMENT_CAPTCHA_ENABLED: "false",
    COMMENT_RATE_LIMIT_MAX: "5",
    COMMENT_RATE_LIMIT_WINDOW_MS: "60000",
    CRON_SECRET: "cron-secret",
    DATABASE_URL: "mysql://user:pass@localhost:3306/equip_blog",
    DEFAULT_LOCALE: "en",
    LOCAL_MEDIA_BASE_PATH: "public/uploads",
    LOCAL_MEDIA_BASE_URL: "/uploads",
    MEDIA_DRIVER: "local",
    NEXT_PUBLIC_APP_URL: "https://example.com",
    NEXT_PUBLIC_WHATSAPP_ADVERT_NUMBER: "+256783230321",
    OPENAI_API_KEY: "test-openai-key",
    REVALIDATE_SECRET: "revalidate-secret",
    SESSION_MAX_AGE_SECONDS: "3600",
    SESSION_SECRET: "session-secret",
    SUPPORTED_LOCALES: "en",
    UPLOAD_ALLOWED_MIME_TYPES: "image/png,image/jpeg",
  };
}

function createEquipmentRecords() {
  return [
    {
      _count: {
        posts: 1,
      },
      id: "equipment_1",
      lifecycleNotes: "Primary draft exists.",
      lifecycleStatus: "GENERATED",
      name: "Microscope",
      normalizedName: "microscope",
      postedAt: null,
      posts: [
        {
          editorialStage: "GENERATED",
          id: "post_1",
          publishedAt: null,
          scheduledPublishAt: null,
          slug: "microscope",
          status: "DRAFT",
          translations: [
            {
              title: "Microscope overview",
            },
          ],
          updatedAt: new Date("2026-04-10T09:00:00.000Z"),
        },
      ],
      slug: "microscope",
      updatedAt: new Date("2026-04-10T09:00:00.000Z"),
    },
    {
      _count: {
        posts: 0,
      },
      id: "equipment_2",
      lifecycleNotes: null,
      lifecycleStatus: "PLANNED",
      name: "Monitor",
      normalizedName: "monitor",
      postedAt: null,
      posts: [],
      slug: "monitor",
      updatedAt: new Date("2026-04-09T07:00:00.000Z"),
    },
    {
      _count: {
        posts: 1,
      },
      id: "equipment_3",
      lifecycleNotes: "Already published.",
      lifecycleStatus: "POSTED",
      name: "Ventilator",
      normalizedName: "ventilator",
      postedAt: new Date("2026-04-08T07:00:00.000Z"),
      posts: [
        {
          editorialStage: "APPROVED",
          id: "post_3",
          publishedAt: new Date("2026-04-08T07:00:00.000Z"),
          scheduledPublishAt: null,
          slug: "ventilator",
          status: "PUBLISHED",
          translations: [
            {
              title: "Ventilator guide",
            },
          ],
          updatedAt: new Date("2026-04-08T07:00:00.000Z"),
        },
      ],
      slug: "ventilator",
      updatedAt: new Date("2026-04-08T07:00:00.000Z"),
    },
  ];
}

function matchesSearch(record, searchValue) {
  if (!searchValue) {
    return true;
  }

  const haystack = [
    record.name,
    record.normalizedName,
    record.slug,
    record.posts[0]?.translations?.[0]?.title,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchValue.toLowerCase());
}

function matchesEquipmentWhere(record, where = {}) {
  if (where.lifecycleStatus && record.lifecycleStatus !== where.lifecycleStatus) {
    return false;
  }

  if (Array.isArray(where.OR) && where.OR.length) {
    const searchValue =
      where.OR[0]?.name?.contains ||
      where.OR[1]?.normalizedName?.contains ||
      where.OR[2]?.slug?.contains ||
      where.OR[3]?.posts?.some?.translations?.some?.title?.contains ||
      "";

    return matchesSearch(record, searchValue);
  }

  return true;
}

function createMockPrisma() {
  const equipmentRecords = createEquipmentRecords();
  const providerConfig = {
    apiKeyEncrypted: null,
    apiKeyEnvName: "OPENAI_API_KEY",
    apiKeyLast4: null,
    apiKeyUpdatedAt: null,
    id: "provider_cfg_default_generation",
    isDefault: true,
    isEnabled: true,
    model: "gpt-5.4",
    provider: "openai",
    purpose: "draft_generation",
    updatedAt: new Date("2026-04-10T09:00:00.000Z"),
  };

  return {
    equipment: {
      count: vi.fn(async ({ where } = {}) =>
        equipmentRecords.filter((record) => matchesEquipmentWhere(record, where)).length),
      findMany: vi.fn(async ({ orderBy, skip = 0, take = equipmentRecords.length, where } = {}) => {
        let items = equipmentRecords.filter((record) => matchesEquipmentWhere(record, where));

        if (orderBy?.[0]?.updatedAt === "desc") {
          items = [...items].sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());
        } else {
          items = [...items].sort((left, right) => left.name.localeCompare(right.name));
        }

        return items.slice(skip, skip + take);
      }),
    },
    modelProviderConfig: {
      findFirst: vi.fn(async () => providerConfig),
    },
  };
}

const originalEnv = process.env;

describe("equipment management feature", () => {
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

  it("builds the equipment management snapshot with normalized filters and provider state", async () => {
    const prisma = createMockPrisma();
    const { getEquipmentManagementSnapshot } = await import("./index");

    const snapshot = await getEquipmentManagementSnapshot(
      {
        lifecycleStatus: "generated",
        page: "3",
        search: " microscope ",
      },
      prisma,
    );

    expect(snapshot.filters).toEqual({
      lifecycleStatus: "generated",
      locale: "en",
      page: 1,
      search: "microscope",
    });
    expect(snapshot.summary).toMatchObject({
      generatedCount: 1,
      plannedCount: 1,
      postedCount: 1,
      totalCount: 3,
    });
    expect(snapshot.defaultProviderConfig).toMatchObject({
      credentialState: "environment",
      hasUsableCredential: true,
      provider: "openai",
    });
    expect(snapshot.items[0]).toMatchObject({
      lifecycleStatus: "GENERATED",
      name: "Microscope",
      primaryPost: {
        title: "Microscope overview",
      },
    });
  });

  it("builds a compact dashboard preview without provider metadata", async () => {
    const prisma = createMockPrisma();
    const { getEquipmentDashboardPreview } = await import("./index");

    const preview = await getEquipmentDashboardPreview(prisma);

    expect(preview.summary).toMatchObject({
      generatedCount: 1,
      plannedCount: 1,
      postedCount: 1,
      totalCount: 3,
    });
    expect(preview.items).toHaveLength(3);
    expect(preview.items[0]).toMatchObject({
      id: "equipment_1",
      name: "Microscope",
    });
  });

  it("requires an authenticated actor before opening a manual draft workflow", async () => {
    const { createManualEquipmentDraft } = await import("./index");

    await expect(createManualEquipmentDraft({ equipmentId: "equipment_1" }, {}, {})).rejects.toMatchObject({
      status: "admin_actor_required",
      statusCode: 400,
    });
  });

  it("requires an authenticated actor before generating equipment content", async () => {
    const { generateEquipmentPost } = await import("./index");

    await expect(generateEquipmentPost({ equipmentId: "equipment_1" }, {}, {})).rejects.toMatchObject({
      status: "admin_actor_required",
      statusCode: 400,
    });
  });
});
