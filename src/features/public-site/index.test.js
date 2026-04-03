import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createBaseServerEnv() {
  return {
    ADMIN_SEED_EMAIL: "admin@example.com",
    ADMIN_SEED_PASSWORD: "password123",
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
    LOCAL_MEDIA_BASE_PATH: "d:/coding/apps/equip-blog/public/uploads",
    LOCAL_MEDIA_BASE_URL: "/uploads",
    MEDIA_DRIVER: "local",
    NEXT_PUBLIC_APP_URL: "https://example.com",
    OPENAI_API_KEY: "test-openai-key",
    REVALIDATE_SECRET: "revalidate-secret",
    SESSION_MAX_AGE_SECONDS: "3600",
    SESSION_SECRET: "session-secret",
    SUPPORTED_LOCALES: "en",
    UPLOAD_ALLOWED_MIME_TYPES: "image/png,image/jpeg",
  };
}

function createListPost(overrides = {}) {
  return {
    categories: [
      {
        category: {
          name: "Maintenance",
          slug: "maintenance",
        },
      },
    ],
    equipment: {
      name: "Microscope",
      slug: "microscope",
    },
    excerpt: "Base excerpt",
    featuredImage: {
      alt: "Microscope",
      attributionText: null,
      caption: "Bench microscope",
      licenseType: null,
      publicUrl: "https://cdn.example.com/microscope.jpg",
      sourceUrl: null,
    },
    id: "post_1",
    manufacturers: [
      {
        manufacturer: {
          name: "Olympus",
          slug: "olympus",
        },
      },
    ],
    publishedAt: new Date("2026-04-03T08:00:00.000Z"),
    slug: "microscope-basics",
    translations: [
      {
        excerpt: "Localized excerpt",
        faqJson: [],
        locale: "en",
        structuredContentJson: {
          sections: [],
        },
        title: "Microscope basics",
      },
    ],
    updatedAt: new Date("2026-04-03T09:00:00.000Z"),
    ...overrides,
  };
}

const originalEnv = process.env;

describe("public site data", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      ...createBaseServerEnv(),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("lists published posts as public cards with pagination metadata", async () => {
    const prisma = {
      post: {
        count: vi.fn().mockResolvedValue(2),
        findMany: vi.fn().mockResolvedValue([
          createListPost(),
          createListPost({
            id: "post_2",
            slug: "centrifuge-guide",
            equipment: {
              name: "Centrifuge",
              slug: "centrifuge",
            },
            translations: [
              {
                excerpt: "Centrifuge excerpt",
                faqJson: [],
                locale: "en",
                structuredContentJson: {
                  sections: [],
                },
                title: "Centrifuge guide",
              },
            ],
          }),
        ]),
      },
    };
    const { listPublishedPosts } = await import("./index");

    const snapshot = await listPublishedPosts(
      {
        locale: "en",
        page: "1",
        search: " microscope ",
      },
      prisma,
    );

    expect(prisma.post.count).toHaveBeenCalledTimes(1);
    expect(prisma.post.findMany).toHaveBeenCalledTimes(1);
    expect(snapshot.search).toBe("microscope");
    expect(snapshot.pagination).toMatchObject({
      currentPage: 1,
      totalItems: 2,
      totalPages: 1,
    });
    expect(snapshot.posts[0]).toMatchObject({
      excerpt: "Localized excerpt",
      path: "/en/blog/microscope-basics",
      title: "Microscope basics",
      url: "https://example.com/en/blog/microscope-basics",
    });
    expect(snapshot.posts[0].categories[0]).toEqual({
      name: "Maintenance",
      path: "/en/category/maintenance",
      slug: "maintenance",
    });
  });

  it("builds a public post page with ordered sections, fallback content, related posts, and approved comments", async () => {
    const postRecord = {
      author: {
        name: "Equip Blog Editorial",
      },
      categories: [
        {
          category: {
            id: "category_1",
            name: "Maintenance",
            slug: "maintenance",
          },
        },
      ],
      equipment: {
        description: "Optical inspection equipment",
        id: "equipment_1",
        name: "Microscope",
        slug: "microscope",
      },
      excerpt: "Fallback excerpt",
      featuredImage: {
        alt: "Microscope",
        attributionText: null,
        caption: "Primary microscope image",
        licenseType: null,
        publicUrl: "https://cdn.example.com/microscope.jpg",
        sourceUrl: null,
      },
      id: "post_1",
      manufacturers: [
        {
          manufacturer: {
            id: "manufacturer_1",
            name: "Olympus",
            slug: "olympus",
          },
        },
      ],
      publishedAt: new Date("2026-04-03T08:00:00.000Z"),
      slug: "microscope-basics",
      sourceReferences: [
        {
          fileType: "PDF",
          language: "English",
          sourceType: "OFFICIAL_MANUAL",
          title: "Microscope service manual",
          url: "https://example.com/manual.pdf",
        },
      ],
      status: "PUBLISHED",
      translations: [
        {
          disclaimer: "English disclaimer",
          excerpt: "Localized excerpt",
          faqJson: [
            {
              answer: "It magnifies specimens.",
              question: "What is a microscope used for?",
            },
          ],
          locale: "en",
          seoRecord: {
            authorsJson: ["Equip Blog Editorial"],
            canonicalUrl: "https://example.com/en/blog/microscope-basics",
            keywordsJson: ["Microscope", "Maintenance"],
            metaDescription: "Microscope meta description",
            metaTitle: "Microscope meta title",
            noindex: false,
            ogDescription: "Microscope meta description",
            ogImage: null,
            ogTitle: "Microscope meta title",
            twitterDescription: "Microscope meta description",
            twitterTitle: "Microscope meta title",
          },
          structuredContentJson: {
            sections: [
              {
                id: "featured_image",
                images: [
                  {
                    alt: "Secondary microscope image",
                    caption: "Secondary view",
                    url: "https://cdn.example.com/microscope-secondary.jpg",
                  },
                ],
                kind: "image_gallery",
                title: "Featured image",
              },
              {
                id: "definition_and_overview",
                kind: "text",
                paragraphs: ["Microscopes magnify small structures for inspection."],
                title: "Definition and overview",
              },
            ],
          },
          title: "Microscope basics",
          updatedAt: new Date("2026-04-03T09:30:00.000Z"),
        },
      ],
      updatedAt: new Date("2026-04-03T09:45:00.000Z"),
    };
    const prisma = {
      comment: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([
          {
            body: "Very helpful summary.",
            createdAt: new Date("2026-04-03T10:00:00.000Z"),
            id: "comment_1",
            name: "Amina",
            replies: [
              {
                body: "Thanks for reading.",
                createdAt: new Date("2026-04-03T10:30:00.000Z"),
                id: "reply_1",
                name: "Editor",
              },
            ],
          },
        ]),
      },
      post: {
        findMany: vi.fn().mockResolvedValue([
          createListPost({
            categories: postRecord.categories,
            equipment: postRecord.equipment,
            featuredImage: postRecord.featuredImage,
            id: "post_2",
            manufacturers: postRecord.manufacturers,
            publishedAt: new Date("2026-04-02T08:00:00.000Z"),
            slug: "microscope-maintenance",
            translations: [
              {
                excerpt: "Maintenance post excerpt",
                locale: "en",
                structuredContentJson: {
                  sections: [],
                },
                title: "Microscope maintenance",
              },
            ],
          }),
        ]),
        findUnique: vi.fn().mockResolvedValue(postRecord),
      },
    };
    const { getPublishedPostPageData } = await import("./index");

    const pageData = await getPublishedPostPageData(
      {
        commentsPage: "1",
        locale: "en",
        slug: "microscope-basics",
      },
      prisma,
    );

    expect(pageData.article.metadata).toMatchObject({
      authors: ["Equip Blog Editorial"],
      description: "Microscope meta description",
      keywords: ["Microscope", "Maintenance"],
      noindex: false,
      ogDescription: "Microscope meta description",
      ogImage: null,
      ogTitle: "Microscope meta title",
      title: "Microscope meta title",
      twitterDescription: "Microscope meta description",
      twitterTitle: "Microscope meta title",
    });
    expect(pageData.article.heroImages).toHaveLength(2);
    expect(pageData.article.bodySections.map((section) => section.id)).toEqual([
      "definition_and_overview",
      "faq",
      "references",
      "disclaimer",
    ]);
    expect(pageData.article.comments.items[0]).toMatchObject({
      body: "Very helpful summary.",
      name: "Amina",
      replies: [
        {
          body: "Thanks for reading.",
          name: "Editor",
        },
      ],
    });
    expect(pageData.article.relatedPosts[0]).toMatchObject({
      path: "/en/blog/microscope-maintenance",
      title: "Microscope maintenance",
    });
  });

  it("builds manufacturer landing pages from published post relationships", async () => {
    const prisma = {
      manufacturer: {
        findUnique: vi.fn().mockResolvedValue({
          branchCountriesJson: ["Japan", "Germany"],
          headquartersCountry: "Japan",
          id: "manufacturer_1",
          name: "Olympus",
          primaryDomain: "olympus.example",
          slug: "olympus",
        }),
      },
      post: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([createListPost()]),
      },
    };
    const { getPublishedLandingPageData } = await import("./index");

    const pageData = await getPublishedLandingPageData(
      {
        entityKind: "manufacturer",
        locale: "en",
        slug: "olympus",
      },
      prisma,
    );

    expect(pageData.entity).toEqual({
      branchCountries: ["Japan", "Germany"],
      description: "olympus.example",
      headquartersCountry: "Japan",
      name: "Olympus",
      path: "/en/manufacturer/olympus",
      primaryDomain: "olympus.example",
      slug: "olympus",
      summary: "olympus.example",
      type: "manufacturer",
    });
    expect(pageData.posts[0].path).toBe("/en/blog/microscope-basics");
  });
});
