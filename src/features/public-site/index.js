import { CommentStatus, PostStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { getCommentSubmissionFormSnapshot } from "@/features/comments";
import { defaultLocale, isSupportedLocale } from "@/features/i18n/config";
import { buildLocalizedPath, publicRouteSegments } from "@/features/i18n/routing";
import { env } from "@/lib/env/server";
import { generatedArticleSectionOrder } from "@/lib/content/article-structure";
import { normalizeDisplayText } from "@/lib/normalization";

export const publicDataRevalidateSeconds = 300;
export const publicListingPageSize = 12;
export const publicCommentsPageSize = 10;

const articleSectionOrderIndex = new Map(
  generatedArticleSectionOrder.map((sectionId, index) => [sectionId, index]),
);

const publicEntityKinds = Object.freeze(["category", "manufacturer", "equipment"]);

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : null;
}

function normalizePublicLocale(locale) {
  if (typeof locale !== "string") {
    return defaultLocale;
  }

  const normalizedLocale = locale.trim().toLowerCase();

  return isSupportedLocale(normalizedLocale) ? normalizedLocale : defaultLocale;
}

function normalizePositiveInteger(value, fallback = 1) {
  const parsedValue = Number.parseInt(`${value ?? ""}`.trim(), 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

function dedupeBy(values, getKey) {
  const seenKeys = new Set();
  const dedupedValues = [];

  for (const value of values) {
    const key = getKey(value);

    if (!key || seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    dedupedValues.push(value);
  }

  return dedupedValues;
}

function toAbsolutePublicUrl(path) {
  return `${env.app.url}${path}`;
}

function getMediaUrl(media) {
  return media?.publicUrl || media?.sourceUrl || null;
}

function createMediaImage(media, fallbackAlt) {
  const url = getMediaUrl(media);

  if (!url) {
    return null;
  }

  return {
    alt: media?.alt || media?.caption || fallbackAlt,
    attributionText: media?.attributionText || null,
    caption: media?.caption || null,
    licenseType: media?.licenseType || null,
    url,
  };
}

function createSectionImage(image, fallbackAlt) {
  const url = typeof image?.url === "string" ? image.url.trim() : "";

  if (!url) {
    return null;
  }

  return {
    alt: image.alt || image.caption || fallbackAlt,
    attributionText: image.attributionText || null,
    caption: image.caption || null,
    licenseType: image.licenseType || null,
    url,
  };
}

function normalizeStructuredSections(translation) {
  const sections = translation?.structuredContentJson?.sections;

  if (!Array.isArray(sections)) {
    return [];
  }

  return sections.filter((section) => section && typeof section === "object" && section.id && section.title);
}

function sortSectionsInRequiredOrder(sections) {
  return sections
    .map((section, index) => ({
      index,
      order:
        articleSectionOrderIndex.has(section.id)
          ? articleSectionOrderIndex.get(section.id)
          : generatedArticleSectionOrder.length + index,
      section,
    }))
    .sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.section);
}

function createFaqFallbackSection(translation) {
  const faqItems = Array.isArray(translation?.faqJson)
    ? translation.faqJson.filter((item) => item?.question && item?.answer)
    : [];

  if (!faqItems.length) {
    return null;
  }

  return {
    id: "faq",
    items: faqItems,
    kind: "faq",
    title: "FAQ",
  };
}

function createReferencesFallbackSection(sourceReferences) {
  if (!sourceReferences.length) {
    return null;
  }

  return {
    id: "references",
    items: sourceReferences.map((reference) => ({
      fileType: reference.fileType || null,
      language: reference.language || null,
      sourceType: reference.sourceType,
      title: reference.title,
      url: reference.url,
    })),
    kind: "references",
    title: "References",
  };
}

function createDisclaimerFallbackSection(translation) {
  const disclaimer = translation?.disclaimer?.trim();

  if (!disclaimer) {
    return null;
  }

  return {
    id: "disclaimer",
    kind: "text",
    paragraphs: [disclaimer],
    title: "Disclaimer",
  };
}

function buildHeroImages(post, translation) {
  const fallbackAlt = translation?.title || post?.equipment?.name || "Featured article image";
  const structuredSections = normalizeStructuredSections(translation);
  const featuredImageSection = structuredSections.find((section) => section.id === "featured_image");
  const structuredImages = Array.isArray(featuredImageSection?.images)
    ? featuredImageSection.images.map((image) => createSectionImage(image, fallbackAlt)).filter(Boolean)
    : [];
  const mediaImage = createMediaImage(post?.featuredImage, fallbackAlt);

  return dedupeBy([mediaImage, ...structuredImages].filter(Boolean), (image) => image.url);
}

function buildPostBodySections(translation, sourceReferences) {
  const structuredSections = normalizeStructuredSections(translation).filter(
    (section) => section.id !== "featured_image",
  );
  const sectionIds = new Set(structuredSections.map((section) => section.id));
  const sections = [...structuredSections];

  if (!sectionIds.has("faq")) {
    const faqSection = createFaqFallbackSection(translation);

    if (faqSection) {
      sections.push(faqSection);
    }
  }

  if (!sectionIds.has("references")) {
    const referencesSection = createReferencesFallbackSection(sourceReferences);

    if (referencesSection) {
      sections.push(referencesSection);
    }
  }

  if (!sectionIds.has("disclaimer")) {
    const disclaimerSection = createDisclaimerFallbackSection(translation);

    if (disclaimerSection) {
      sections.push(disclaimerSection);
    }
  }

  return sortSectionsInRequiredOrder(sections);
}

function createPublishedPostCard(post, locale) {
  const translation = post.translations?.[0] || null;
  const path = buildLocalizedPath(locale, publicRouteSegments.blogPost(post.slug));

  return {
    categories: post.categories.map(({ category }) => ({
      name: category.name,
      path: buildLocalizedPath(locale, publicRouteSegments.category(category.slug)),
      slug: category.slug,
    })),
    equipment: {
      name: post.equipment.name,
      path: buildLocalizedPath(locale, publicRouteSegments.equipment(post.equipment.slug)),
      slug: post.equipment.slug,
    },
    excerpt: translation?.excerpt || post.excerpt || "",
    heroImage: buildHeroImages(post, translation)[0] || null,
    manufacturers: post.manufacturers.map(({ manufacturer }) => ({
      name: manufacturer.name,
      path: buildLocalizedPath(locale, publicRouteSegments.manufacturer(manufacturer.slug)),
      slug: manufacturer.slug,
    })),
    path,
    publishedAt: serializeDate(post.publishedAt),
    slug: post.slug,
    title: translation?.title || post.equipment.name,
    updatedAt: serializeDate(post.updatedAt),
    url: toAbsolutePublicUrl(path),
  };
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

function buildPublishedPostsWhere({ locale, search }) {
  const normalizedSearch = normalizeDisplayText(search);
  const localeCondition = {
    translations: {
      some: {
        locale,
      },
    },
  };

  if (!normalizedSearch) {
    return {
      status: PostStatus.PUBLISHED,
      ...localeCondition,
    };
  }

  return {
    AND: [
      {
        status: PostStatus.PUBLISHED,
      },
      localeCondition,
      {
        OR: [
          {
            equipment: {
              name: {
                contains: normalizedSearch,
              },
            },
          },
          {
            slug: {
              contains: normalizedSearch,
            },
          },
          {
            translations: {
              some: {
                locale,
                OR: [
                  {
                    excerpt: {
                      contains: normalizedSearch,
                    },
                  },
                  {
                    title: {
                      contains: normalizedSearch,
                    },
                  },
                ],
              },
            },
          },
          {
            categories: {
              some: {
                category: {
                  name: {
                    contains: normalizedSearch,
                  },
                },
              },
            },
          },
          {
            manufacturers: {
              some: {
                manufacturer: {
                  name: {
                    contains: normalizedSearch,
                  },
                },
              },
            },
          },
        ],
      },
    ],
  };
}

function buildPublishedPostCardSelect(locale) {
  return {
    categories: {
      orderBy: {
        category: {
          name: "asc",
        },
      },
      select: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    },
    equipment: {
      select: {
        name: true,
        slug: true,
      },
    },
    excerpt: true,
    featuredImage: {
      select: {
        alt: true,
        attributionText: true,
        caption: true,
        licenseType: true,
        publicUrl: true,
        sourceUrl: true,
      },
    },
    id: true,
    manufacturers: {
      orderBy: {
        manufacturer: {
          name: "asc",
        },
      },
      select: {
        manufacturer: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    },
    publishedAt: true,
    slug: true,
    translations: {
      select: {
        excerpt: true,
        faqJson: true,
        structuredContentJson: true,
        title: true,
      },
      take: 1,
      where: {
        locale,
      },
    },
    updatedAt: true,
  };
}

async function resolvePrismaClient(prisma) {
  if (prisma) {
    return prisma;
  }

  const { getPrismaClient } = await import("@/lib/prisma");

  return getPrismaClient();
}

function buildEntityPostWhere({ entityId, entityKind, locale }) {
  const baseWhere = {
    status: PostStatus.PUBLISHED,
    translations: {
      some: {
        locale,
      },
    },
  };

  if (entityKind === "category") {
    return {
      ...baseWhere,
      categories: {
        some: {
          categoryId: entityId,
        },
      },
    };
  }

  if (entityKind === "manufacturer") {
    return {
      ...baseWhere,
      manufacturers: {
        some: {
          manufacturerId: entityId,
        },
      },
    };
  }

  return {
    ...baseWhere,
    equipmentId: entityId,
  };
}

function normalizeBranchCountries(value) {
  return Array.isArray(value)
    ? value.map((entry) => `${entry}`.trim()).filter(Boolean)
    : [];
}

function createEntitySummary(entity, entityKind, locale) {
  if (entityKind === "category") {
    return {
      description: entity.description || "",
      name: entity.name,
      path: buildLocalizedPath(locale, publicRouteSegments.category(entity.slug)),
      slug: entity.slug,
      summary: entity.description || "",
      type: entityKind,
    };
  }

  if (entityKind === "manufacturer") {
    return {
      branchCountries: normalizeBranchCountries(entity.branchCountriesJson),
      description: entity.primaryDomain || "",
      headquartersCountry: entity.headquartersCountry || null,
      name: entity.name,
      path: buildLocalizedPath(locale, publicRouteSegments.manufacturer(entity.slug)),
      primaryDomain: entity.primaryDomain,
      slug: entity.slug,
      summary: entity.primaryDomain,
      type: entityKind,
    };
  }

  return {
    description: entity.description || "",
    name: entity.name,
    path: buildLocalizedPath(locale, publicRouteSegments.equipment(entity.slug)),
    slug: entity.slug,
    summary: entity.description || "",
    type: entityKind,
  };
}

function tallyDiscoveryEntries(posts, entityKind, locale) {
  const tallies = new Map();

  for (const post of posts) {
    const entries =
      entityKind === "category"
        ? post.categories.map(({ category }) => ({
            description: category.description || "",
            id: category.id,
            name: category.name,
            path: buildLocalizedPath(locale, publicRouteSegments.category(category.slug)),
            slug: category.slug,
          }))
        : entityKind === "manufacturer"
          ? post.manufacturers.map(({ manufacturer }) => ({
              branchCountries: normalizeBranchCountries(manufacturer.branchCountriesJson),
              description: manufacturer.primaryDomain || "",
              headquartersCountry: manufacturer.headquartersCountry || null,
              id: manufacturer.id,
              name: manufacturer.name,
              path: buildLocalizedPath(locale, publicRouteSegments.manufacturer(manufacturer.slug)),
              primaryDomain: manufacturer.primaryDomain,
              slug: manufacturer.slug,
            }))
          : [
              {
                description: post.equipment.description || "",
                id: post.equipment.id,
                name: post.equipment.name,
                path: buildLocalizedPath(locale, publicRouteSegments.equipment(post.equipment.slug)),
                slug: post.equipment.slug,
              },
            ];

    for (const entry of entries) {
      const currentEntry = tallies.get(entry.id) || {
        ...entry,
        postCount: 0,
        type: entityKind,
      };

      currentEntry.postCount += 1;
      tallies.set(entry.id, currentEntry);
    }
  }

  return [...tallies.values()].sort((left, right) => {
    if (left.postCount !== right.postCount) {
      return right.postCount - left.postCount;
    }

    return left.name.localeCompare(right.name, undefined, {
      sensitivity: "base",
    });
  });
}

async function listPublishedPostsInternal(
  { locale = defaultLocale, page = 1, pageSize = publicListingPageSize, search } = {},
  prisma,
) {
  const resolvedLocale = normalizePublicLocale(locale);
  const normalizedSearch = normalizeDisplayText(search) || "";
  const requestedPage = normalizePositiveInteger(page);
  const resolvedPageSize = normalizePositiveInteger(pageSize, publicListingPageSize);
  const db = await resolvePrismaClient(prisma);
  const where = buildPublishedPostsWhere({
    locale: resolvedLocale,
    search: normalizedSearch,
  });
  const totalItems = await db.post.count({
    where,
  });
  const pagination = createPagination(totalItems, requestedPage, resolvedPageSize);
  const posts = await db.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { slug: "asc" }],
    select: buildPublishedPostCardSelect(resolvedLocale),
    skip: totalItems ? (pagination.currentPage - 1) * pagination.pageSize : 0,
    take: pagination.pageSize,
    where,
  });

  return {
    locale: resolvedLocale,
    pagination,
    posts: posts.map((post) => createPublishedPostCard(post, resolvedLocale)),
    search: normalizedSearch,
  };
}

async function getPublishedHomePageDataInternal({ locale = defaultLocale } = {}, prisma) {
  const resolvedLocale = normalizePublicLocale(locale);
  const db = await resolvePrismaClient(prisma);
  const latestPosts = await db.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { slug: "asc" }],
    select: buildPublishedPostCardSelect(resolvedLocale),
    take: 7,
    where: {
      status: PostStatus.PUBLISHED,
      translations: {
        some: {
          locale: resolvedLocale,
        },
      },
    },
  });
  const taxonomyPosts = await db.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    select: {
      categories: {
        select: {
          category: {
            select: {
              description: true,
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      equipment: {
        select: {
          description: true,
          id: true,
          name: true,
          slug: true,
        },
      },
      manufacturers: {
        select: {
          manufacturer: {
            select: {
              branchCountriesJson: true,
              headquartersCountry: true,
              id: true,
              name: true,
              primaryDomain: true,
              slug: true,
            },
          },
        },
      },
    },
    where: {
      status: PostStatus.PUBLISHED,
      translations: {
        some: {
          locale: resolvedLocale,
        },
      },
    },
  });
  const categorySpotlights = tallyDiscoveryEntries(taxonomyPosts, "category", resolvedLocale);
  const manufacturerSpotlights = tallyDiscoveryEntries(taxonomyPosts, "manufacturer", resolvedLocale);
  const equipmentSpotlights = tallyDiscoveryEntries(taxonomyPosts, "equipment", resolvedLocale);
  const featuredPosts = latestPosts.map((post) => createPublishedPostCard(post, resolvedLocale));

  return {
    featuredPost: featuredPosts[0] || null,
    latestPosts: featuredPosts.slice(1),
    locale: resolvedLocale,
    searchPath: buildLocalizedPath(resolvedLocale, publicRouteSegments.search),
    spotlights: {
      categories: categorySpotlights.slice(0, 4),
      equipment: equipmentSpotlights.slice(0, 4),
      manufacturers: manufacturerSpotlights.slice(0, 4),
    },
    stats: {
      categoryCount: categorySpotlights.length,
      equipmentCount: equipmentSpotlights.length,
      manufacturerCount: manufacturerSpotlights.length,
      postCount: taxonomyPosts.length,
    },
  };
}

async function getPublishedLandingPageDataInternal(
  { entityKind, locale = defaultLocale, page = 1, pageSize = publicListingPageSize, slug } = {},
  prisma,
) {
  if (!publicEntityKinds.includes(entityKind)) {
    throw new Error(`Unsupported public entity kind "${entityKind}".`);
  }

  const resolvedLocale = normalizePublicLocale(locale);
  const requestedPage = normalizePositiveInteger(page);
  const resolvedPageSize = normalizePositiveInteger(pageSize, publicListingPageSize);
  const db = await resolvePrismaClient(prisma);
  const entitySelect =
    entityKind === "category"
      ? {
          description: true,
          id: true,
          name: true,
          slug: true,
        }
      : entityKind === "manufacturer"
        ? {
            branchCountriesJson: true,
            headquartersCountry: true,
            id: true,
            name: true,
            primaryDomain: true,
            slug: true,
          }
        : {
            description: true,
            id: true,
            name: true,
            slug: true,
          };
  const entityQuery =
    entityKind === "category"
      ? db.category.findUnique({
          select: entitySelect,
          where: { slug },
        })
      : entityKind === "manufacturer"
        ? db.manufacturer.findUnique({
            select: entitySelect,
            where: { slug },
          })
        : db.equipment.findUnique({
            select: entitySelect,
            where: { slug },
          });
  const entity = await entityQuery;

  if (!entity) {
    return null;
  }

  const where = buildEntityPostWhere({
    entityId: entity.id,
    entityKind,
    locale: resolvedLocale,
  });
  const totalItems = await db.post.count({
    where,
  });
  const pagination = createPagination(totalItems, requestedPage, resolvedPageSize);
  const posts = await db.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { slug: "asc" }],
    select: buildPublishedPostCardSelect(resolvedLocale),
    skip: totalItems ? (pagination.currentPage - 1) * pagination.pageSize : 0,
    take: pagination.pageSize,
    where,
  });

  return {
    entity: createEntitySummary(entity, entityKind, resolvedLocale),
    entityKind,
    locale: resolvedLocale,
    pagination,
    posts: posts.map((post) => createPublishedPostCard(post, resolvedLocale)),
  };
}

function buildCommentTree(comments) {
  return comments.map((comment) => ({
    body: comment.body,
    createdAt: serializeDate(comment.createdAt),
    id: comment.id,
    name: comment.name,
    replies: (comment.replies || []).map((reply) => ({
      body: reply.body,
      createdAt: serializeDate(reply.createdAt),
      id: reply.id,
      name: reply.name,
    })),
  }));
}

function buildRelatedPostScore(post, { categoryIds, equipmentId, manufacturerIds }) {
  const sharedCategoryCount = post.categories.filter(({ category }) => categoryIds.has(category.id)).length;
  const sharedManufacturerCount = post.manufacturers.filter(({ manufacturer }) =>
    manufacturerIds.has(manufacturer.id),
  ).length;
  const sameEquipment = post.equipment.id === equipmentId ? 1 : 0;

  return sameEquipment * 3 + sharedCategoryCount * 2 + sharedManufacturerCount;
}

async function getPublishedPostPageDataInternal(
  { commentsPage = 1, locale = defaultLocale, slug } = {},
  prisma,
) {
  const resolvedLocale = normalizePublicLocale(locale);
  const requestedCommentsPage = normalizePositiveInteger(commentsPage);
  const db = await resolvePrismaClient(prisma);
  const post = await db.post.findUnique({
    select: {
      author: {
        select: {
          name: true,
        },
      },
      categories: {
        orderBy: {
          category: {
            name: "asc",
          },
        },
        select: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      equipment: {
        select: {
          description: true,
          id: true,
          name: true,
          slug: true,
        },
      },
      excerpt: true,
      featuredImage: {
        select: {
          alt: true,
          attributionText: true,
          caption: true,
          licenseType: true,
          publicUrl: true,
          sourceUrl: true,
        },
      },
      id: true,
      manufacturers: {
        orderBy: {
          manufacturer: {
            name: "asc",
          },
        },
        select: {
          manufacturer: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      publishedAt: true,
      status: true,
      slug: true,
      sourceReferences: {
        orderBy: {
          title: "asc",
        },
        select: {
          fileType: true,
          language: true,
          sourceType: true,
          title: true,
          url: true,
        },
      },
      translations: {
        select: {
          disclaimer: true,
          excerpt: true,
          faqJson: true,
          seoRecord: {
            select: {
              canonicalUrl: true,
              metaDescription: true,
              metaTitle: true,
              ogDescription: true,
              ogTitle: true,
              twitterDescription: true,
              twitterTitle: true,
            },
          },
          structuredContentJson: true,
          title: true,
          updatedAt: true,
        },
        take: 1,
        where: {
          locale: resolvedLocale,
        },
      },
      updatedAt: true,
    },
    where: {
      slug,
    },
  });

  if (!post || post.status !== PostStatus.PUBLISHED || !post.translations[0] || !post.publishedAt) {
    return null;
  }

  const translation = post.translations[0];
  const path = buildLocalizedPath(resolvedLocale, publicRouteSegments.blogPost(post.slug));
  const canonicalUrl = translation.seoRecord?.canonicalUrl || toAbsolutePublicUrl(path);
  const commentWhere = {
    parentId: null,
    postId: post.id,
    status: CommentStatus.APPROVED,
  };
  const totalApprovedComments = await db.comment.count({
    where: commentWhere,
  });
  const commentsPagination = createPagination(
    totalApprovedComments,
    requestedCommentsPage,
    publicCommentsPageSize,
  );
  const approvedComments = await db.comment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      body: true,
      createdAt: true,
      id: true,
      name: true,
      replies: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          body: true,
          createdAt: true,
          id: true,
          name: true,
        },
        where: {
          status: CommentStatus.APPROVED,
        },
      },
    },
    skip: totalApprovedComments ? (commentsPagination.currentPage - 1) * commentsPagination.pageSize : 0,
    take: commentsPagination.pageSize,
    where: commentWhere,
  });
  const categoryIds = new Set(post.categories.map(({ category }) => category.id));
  const manufacturerIds = new Set(post.manufacturers.map(({ manufacturer }) => manufacturer.id));
  const relatedCandidates = await db.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    select: {
      categories: {
        select: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      equipment: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      excerpt: true,
      featuredImage: {
        select: {
          alt: true,
          caption: true,
          publicUrl: true,
          sourceUrl: true,
        },
      },
      id: true,
      manufacturers: {
        select: {
          manufacturer: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      publishedAt: true,
      slug: true,
      translations: {
        select: {
          excerpt: true,
          structuredContentJson: true,
          title: true,
        },
        take: 1,
        where: {
          locale: resolvedLocale,
        },
      },
      updatedAt: true,
    },
    take: 8,
    where: {
      id: {
        not: post.id,
      },
      OR: [
        {
          equipmentId: post.equipment.id,
        },
        categoryIds.size
          ? {
              categories: {
                some: {
                  categoryId: {
                    in: [...categoryIds],
                  },
                },
              },
            }
          : null,
        manufacturerIds.size
          ? {
              manufacturers: {
                some: {
                  manufacturerId: {
                    in: [...manufacturerIds],
                  },
                },
              },
            }
          : null,
      ].filter(Boolean),
      publishedAt: {
        not: null,
      },
      status: PostStatus.PUBLISHED,
      translations: {
        some: {
          locale: resolvedLocale,
        },
      },
    },
  });
  const relatedPosts = relatedCandidates
    .map((candidate) => ({
      post: createPublishedPostCard(candidate, resolvedLocale),
      score: buildRelatedPostScore(candidate, {
        categoryIds,
        equipmentId: post.equipment.id,
        manufacturerIds,
      }),
    }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return (right.post.publishedAt || "").localeCompare(left.post.publishedAt || "");
    })
    .slice(0, 3)
    .map((entry) => entry.post);

  return {
    article: {
      authorName: post.author.name,
      bodySections: buildPostBodySections(translation, post.sourceReferences),
      breadcrumb: [
        {
          href: buildLocalizedPath(resolvedLocale, publicRouteSegments.home),
          label: "Home",
        },
        {
          href: buildLocalizedPath(resolvedLocale, publicRouteSegments.blog),
          label: "Blog",
        },
        {
          href: path,
          label: translation.title,
        },
      ],
      canonicalUrl,
      categories: post.categories.map(({ category }) => ({
        name: category.name,
        path: buildLocalizedPath(resolvedLocale, publicRouteSegments.category(category.slug)),
        slug: category.slug,
      })),
      comments: {
        form: {
          ...getCommentSubmissionFormSnapshot(),
          postId: post.id,
        },
        items: buildCommentTree(approvedComments),
        pagination: commentsPagination,
      },
      equipment: {
        name: post.equipment.name,
        path: buildLocalizedPath(resolvedLocale, publicRouteSegments.equipment(post.equipment.slug)),
        slug: post.equipment.slug,
      },
      excerpt: translation.excerpt || post.excerpt || "",
      heroImages: buildHeroImages(post, translation),
      manufacturers: post.manufacturers.map(({ manufacturer }) => ({
        name: manufacturer.name,
        path: buildLocalizedPath(resolvedLocale, publicRouteSegments.manufacturer(manufacturer.slug)),
        slug: manufacturer.slug,
      })),
      metadata: {
        description: translation.seoRecord?.metaDescription || translation.excerpt || post.excerpt || "",
        title: translation.seoRecord?.metaTitle || translation.title,
      },
      path,
      publishedAt: serializeDate(post.publishedAt),
      relatedPosts,
      title: translation.title,
      updatedAt: serializeDate(translation.updatedAt || post.updatedAt),
      url: canonicalUrl,
    },
    locale: resolvedLocale,
  };
}

const getCachedPublishedHomePageData = unstable_cache(
  async (locale) => getPublishedHomePageDataInternal({ locale }),
  ["public-home-page-data"],
  {
    revalidate: publicDataRevalidateSeconds,
  },
);

const getCachedPublishedLandingPageData = unstable_cache(
  async (entityKind, locale, page, pageSize, slug) =>
    getPublishedLandingPageDataInternal({ entityKind, locale, page, pageSize, slug }),
  ["public-landing-page-data"],
  {
    revalidate: publicDataRevalidateSeconds,
  },
);

const getCachedPublishedPostPageData = unstable_cache(
  async (commentsPage, locale, slug) =>
    getPublishedPostPageDataInternal({ commentsPage, locale, slug }),
  ["public-post-page-data"],
  {
    revalidate: publicDataRevalidateSeconds,
  },
);

const getCachedPublishedPostsList = unstable_cache(
  async (locale, page, pageSize, search) =>
    listPublishedPostsInternal({ locale, page, pageSize, search }),
  ["public-post-list-data"],
  {
    revalidate: publicDataRevalidateSeconds,
  },
);

export async function listPublishedPosts(options = {}, prisma) {
  if (prisma) {
    return listPublishedPostsInternal(options, prisma);
  }

  return getCachedPublishedPostsList(
    normalizePublicLocale(options.locale),
    normalizePositiveInteger(options.page),
    normalizePositiveInteger(options.pageSize, publicListingPageSize),
    normalizeDisplayText(options.search) || "",
  );
}

export async function getPublishedHomePageData(options = {}, prisma) {
  if (prisma) {
    return getPublishedHomePageDataInternal(options, prisma);
  }

  return getCachedPublishedHomePageData(normalizePublicLocale(options.locale));
}

export async function getPublishedLandingPageData(options = {}, prisma) {
  if (prisma) {
    return getPublishedLandingPageDataInternal(options, prisma);
  }

  return getCachedPublishedLandingPageData(
    options.entityKind,
    normalizePublicLocale(options.locale),
    normalizePositiveInteger(options.page),
    normalizePositiveInteger(options.pageSize, publicListingPageSize),
    options.slug,
  );
}

export async function getPublishedPostPageData(options = {}, prisma) {
  if (prisma) {
    return getPublishedPostPageDataInternal(options, prisma);
  }

  return getCachedPublishedPostPageData(
    normalizePositiveInteger(options.commentsPage),
    normalizePublicLocale(options.locale),
    options.slug,
  );
}
