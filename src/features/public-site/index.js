import { CommentStatus, PostStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { getCommentSubmissionFormSnapshot } from "@/features/comments";
import { defaultLocale, isSupportedLocale, supportedLocales } from "@/features/i18n/config";
import { buildLocalizedPath, publicRouteSegments } from "@/features/i18n/routing";
import { env } from "@/lib/env/server";
import { generatedArticleSectionOrder } from "@/lib/content/article-structure";
import { getRenderableImageUrl } from "@/lib/media";
import { normalizeDisplayText, normalizeEquipmentName } from "@/lib/normalization";

export const publicDataRevalidateSeconds = 300;
export const publicListingPageSize = 12;
export const publicCommentsPageSize = 10;
export const publicEquipmentSuggestionLimit = 8;

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

function getDateSortValue(value) {
  if (!value) {
    return 0;
  }

  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function compareDatesDescending(left, right) {
  return getDateSortValue(right) - getDateSortValue(left);
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

function dedupeStrings(values) {
  return [...new Set((values || []).map((value) => `${value}`.trim()).filter(Boolean))];
}

function normalizeSearchValue(value) {
  return normalizeEquipmentName(normalizeDisplayText(value) || "");
}

function stripHtml(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/<[^>]+>/g, " ");
}

function collectJsonText(value, collected = []) {
  if (typeof value === "string") {
    const normalizedValue = normalizeDisplayText(value);

    if (normalizedValue) {
      collected.push(normalizedValue);
    }

    return collected;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectJsonText(entry, collected);
    }

    return collected;
  }

  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) {
      collectJsonText(entry, collected);
    }
  }

  return collected;
}

function createBodySearchText(translation) {
  return normalizeDisplayText(
    [
      translation?.contentMd,
      stripHtml(translation?.contentHtml),
      collectJsonText(translation?.structuredContentJson).join(" "),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function selectPostTranslation(post, locale) {
  return post.translations?.find((entry) => entry.locale === locale) || post.translations?.[0] || null;
}

function scoreSearchField(value, normalizedSearch, searchTokens, weights) {
  const normalizedValue = normalizeSearchValue(value);

  if (!normalizedValue || !normalizedSearch) {
    return 0;
  }

  let score = 0;

  if (normalizedValue === normalizedSearch) {
    score += weights.exact || 0;
  } else if (
    normalizedValue.startsWith(normalizedSearch) &&
    (normalizedValue.length === normalizedSearch.length ||
      normalizedValue.charAt(normalizedSearch.length) === " ")
  ) {
    score += weights.prefix || 0;
  } else if (normalizedValue.includes(normalizedSearch)) {
    score += weights.contains || 0;
  }

  if (weights.token) {
    score += searchTokens.reduce(
      (total, token) => total + (token && normalizedValue.includes(token) ? weights.token : 0),
      0,
    );
  }

  return score;
}

function sumSearchFieldScores(values, normalizedSearch, searchTokens, weights) {
  return (values || []).reduce(
    (total, value) => total + scoreSearchField(value, normalizedSearch, searchTokens, weights),
    0,
  );
}

function getSearchResultTier(post, locale, normalizedSearch) {
  const translation = selectPostTranslation(post, locale);
  const normalizedTitle = normalizeSearchValue(translation?.title);

  if (!normalizedTitle || !normalizedSearch) {
    return 1;
  }

  if (normalizedTitle === normalizedSearch) {
    return 3;
  }

  if (
    normalizedTitle.startsWith(normalizedSearch) &&
    (normalizedTitle.length === normalizedSearch.length ||
      normalizedTitle.charAt(normalizedSearch.length) === " ")
  ) {
    return 2;
  }

  return 1;
}

function buildWeightedSearchScore(post, locale, normalizedSearch, searchTokens) {
  const translation = selectPostTranslation(post, locale);

  return (
    sumSearchFieldScores([translation?.title], normalizedSearch, searchTokens, {
      contains: 6,
      token: 1,
    }) +
    sumSearchFieldScores([translation?.excerpt || post.excerpt], normalizedSearch, searchTokens, {
      contains: 5,
      exact: 6,
      prefix: 5,
      token: 1,
    }) +
    sumSearchFieldScores([createBodySearchText(translation)], normalizedSearch, searchTokens, {
      contains: 3,
      exact: 4,
      prefix: 4,
      token: 1,
    }) +
    sumSearchFieldScores([post.equipment?.name], normalizedSearch, searchTokens, {
      contains: 6,
      exact: 8,
      prefix: 7,
      token: 1,
    }) +
    sumSearchFieldScores(
      post.manufacturers.map(({ manufacturer }) => manufacturer.name),
      normalizedSearch,
      searchTokens,
      {
        contains: 5,
        exact: 7,
        prefix: 6,
        token: 1,
      },
    ) +
    sumSearchFieldScores(
      post.tags.flatMap(({ tag }) => [tag.name, tag.slug]),
      normalizedSearch,
      searchTokens,
      {
        contains: 5,
        exact: 7,
        prefix: 6,
        token: 1,
      },
    )
  );
}

function normalizeJsonStringList(value) {
  return Array.isArray(value)
    ? value.map((entry) => `${entry}`.trim()).filter(Boolean)
    : [];
}

function toAbsolutePublicUrl(path) {
  return `${env.app.url}${path}`;
}

function getMediaUrl(media) {
  return media?.publicUrl || media?.sourceUrl || null;
}

function normalizeImageDimension(value) {
  const parsedValue = Number.parseInt(`${value ?? ""}`.trim(), 10);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function buildResponsiveImageSrcSet(media, url) {
  const candidates = [];
  const seenEntries = new Set();

  for (const variant of media?.variants || []) {
    const variantUrl = getMediaUrl(variant);
    const variantWidth = normalizeImageDimension(variant?.width);

    if (!variantUrl || !variantWidth) {
      continue;
    }

    const candidateKey = `${variantUrl}:${variantWidth}`;

    if (seenEntries.has(candidateKey)) {
      continue;
    }

    seenEntries.add(candidateKey);
    candidates.push({
      url: variantUrl,
      width: variantWidth,
    });
  }

  const originalWidth = normalizeImageDimension(media?.width);

  if (url && originalWidth) {
    const candidateKey = `${url}:${originalWidth}`;

    if (!seenEntries.has(candidateKey)) {
      candidates.push({
        url,
        width: originalWidth,
      });
    }
  }

  if (candidates.length <= 1) {
    return null;
  }

  return candidates
    .sort((leftEntry, rightEntry) => leftEntry.width - rightEntry.width)
    .map((candidate) => `${candidate.url} ${candidate.width}w`)
    .join(", ");
}

function createMediaImage(media, fallbackAlt) {
  const rawUrl = getMediaUrl(media);
  const alt = media?.alt || media?.caption || fallbackAlt;
  const caption = media?.caption || null;
  const height = normalizeImageDimension(media?.height);
  const width = normalizeImageDimension(media?.width);
  const url = getRenderableImageUrl(rawUrl, {
    alt,
    caption,
    height,
    width,
  });

  if (!url) {
    return null;
  }

  return {
    alt,
    attributionText: media?.attributionText || null,
    caption,
    height,
    licenseType: media?.licenseType || null,
    srcSet: rawUrl === url ? buildResponsiveImageSrcSet(media, rawUrl) : null,
    url,
    width,
  };
}

function createSectionImage(image, fallbackAlt) {
  const rawUrl = typeof image?.url === "string" ? image.url.trim() : "";
  const alt = image.alt || image.caption || fallbackAlt;
  const caption = image.caption || null;
  const height = normalizeImageDimension(image?.height);
  const width = normalizeImageDimension(image?.width);
  const url = getRenderableImageUrl(rawUrl, {
    alt,
    caption,
    height,
    width,
  });

  if (!url) {
    return null;
  }

  return {
    alt,
    attributionText: image.attributionText || null,
    caption,
    height,
    licenseType: image.licenseType || null,
    url,
    width,
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
  const translation = selectPostTranslation(post, locale);
  const cardLocale = translation?.locale || locale;
  const path = buildLocalizedPath(cardLocale, publicRouteSegments.blogPost(post.slug));

  return {
    categories: post.categories.map(({ category }) => ({
      name: category.name,
      path: buildLocalizedPath(cardLocale, publicRouteSegments.category(category.slug)),
      slug: category.slug,
    })),
    equipment: {
      name: post.equipment.name,
      path: buildLocalizedPath(cardLocale, publicRouteSegments.equipment(post.equipment.slug)),
      slug: post.equipment.slug,
    },
    excerpt: translation?.excerpt || post.excerpt || "",
    heroImage: buildHeroImages(post, translation)[0] || null,
    manufacturers: post.manufacturers.map(({ manufacturer }) => ({
      name: manufacturer.name,
      path: buildLocalizedPath(cardLocale, publicRouteSegments.manufacturer(manufacturer.slug)),
      slug: manufacturer.slug,
    })),
    locale: cardLocale,
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

function buildPublishedPostsWhere({ locale }) {
  return {
    status: PostStatus.PUBLISHED,
    translations: {
      some: {
        locale,
      },
    },
  };
}

function buildPublishedSearchWhere({ locale, search }) {
  const normalizedSearch = normalizeDisplayText(search);
  return {
    status: PostStatus.PUBLISHED,
    translations: {
      some: {
        locale,
      },
    },
    OR: [
      {
        equipment: {
          name: {
            contains: normalizedSearch,
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
      {
        tags: {
          some: {
            tag: {
              OR: [
                {
                  name: {
                    contains: normalizedSearch,
                  },
                },
                {
                  slug: {
                    contains: normalizedSearch,
                  },
                },
              ],
            },
          },
        },
      },
      {
        translations: {
          some: {
            locale,
            OR: [
              {
                title: {
                  contains: normalizedSearch,
                },
              },
              {
                excerpt: {
                  contains: normalizedSearch,
                },
              },
              {
                contentMd: {
                  contains: normalizedSearch,
                },
              },
              {
                contentHtml: {
                  contains: normalizedSearch,
                },
              },
            ],
          },
        },
      },
    ],
  };
}

function createPublicMediaImageSelect() {
  return {
    alt: true,
    attributionText: true,
    caption: true,
    height: true,
    licenseType: true,
    publicUrl: true,
    sourceUrl: true,
    variants: {
      orderBy: {
        width: "asc",
      },
      select: {
        publicUrl: true,
        width: true,
      },
    },
    width: true,
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
      select: createPublicMediaImageSelect(),
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
        locale: true,
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

function buildSearchPostSelect(locale) {
  const baseSelect = buildPublishedPostCardSelect(locale);

  return {
    ...baseSelect,
    tags: {
      orderBy: {
        tag: {
          name: "asc",
        },
      },
      select: {
        tag: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    },
    translations: {
      select: {
        contentHtml: true,
        contentMd: true,
        excerpt: true,
        locale: true,
        structuredContentJson: true,
        title: true,
      },
      take: 1,
      where: {
        locale,
      },
    },
  };
}

function buildDiscoveryPostSelect() {
  return {
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
  };
}

function buildRelatedPostSelect(locales = supportedLocales) {
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
      select: createPublicMediaImageSelect(),
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
    slug: true,
    tags: {
      orderBy: {
        tag: {
          name: "asc",
        },
      },
      select: {
        tag: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
    translations: {
      select: {
        excerpt: true,
        locale: true,
        structuredContentJson: true,
        title: true,
      },
      where: {
        locale: {
          in: locales,
        },
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

function truncateSummary(value, maxLength = 120) {
  const normalizedValue = normalizeDisplayText(value);

  if (!normalizedValue) {
    return "";
  }

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}

function buildPublishedEquipmentSuggestionWhere({ locale, search }) {
  const normalizedSearch = normalizeDisplayText(search);
  const normalizedEquipmentSearch = normalizeSearchValue(normalizedSearch);

  return {
    posts: {
      some: {
        publishedAt: {
          not: null,
        },
        status: PostStatus.PUBLISHED,
        translations: {
          some: {
            locale,
          },
        },
      },
    },
    OR: [
      {
        name: {
          contains: normalizedSearch,
        },
      },
      {
        normalizedName: {
          contains: normalizedEquipmentSearch,
        },
      },
      {
        description: {
          contains: normalizedSearch,
        },
      },
      {
        aliases: {
          some: {
            OR: [
              {
                alias: {
                  contains: normalizedSearch,
                },
              },
              {
                normalizedAlias: {
                  contains: normalizedEquipmentSearch,
                },
              },
            ],
          },
        },
      },
    ],
  };
}

function findMatchedEquipmentAlias(aliases, normalizedSearch) {
  if (!normalizedSearch) {
    return null;
  }

  return (
    (aliases || []).find((alias) => {
      const normalizedAlias = normalizeSearchValue(alias.alias);

      if (!normalizedAlias) {
        return false;
      }

      return (
        normalizedAlias === normalizedSearch ||
        normalizedAlias.startsWith(normalizedSearch) ||
        normalizedAlias.includes(normalizedSearch)
      );
    })?.alias || null
  );
}

function getEquipmentSuggestionTier(equipment, matchedAlias, normalizedSearch) {
  const normalizedName = normalizeSearchValue(equipment.name);
  const normalizedAlias = normalizeSearchValue(matchedAlias);

  if (normalizedName && normalizedName === normalizedSearch) {
    return 4;
  }

  if (normalizedAlias && normalizedAlias === normalizedSearch) {
    return 3;
  }

  if (normalizedName && normalizedName.startsWith(normalizedSearch)) {
    return 2;
  }

  if (normalizedAlias && normalizedAlias.startsWith(normalizedSearch)) {
    return 1;
  }

  return 0;
}

function buildEquipmentSuggestionScore(equipment, normalizedSearch, searchTokens) {
  return (
    sumSearchFieldScores([equipment.name], normalizedSearch, searchTokens, {
      contains: 8,
      exact: 12,
      prefix: 10,
      token: 1,
    }) +
    sumSearchFieldScores(
      (equipment.aliases || []).map((alias) => alias.alias),
      normalizedSearch,
      searchTokens,
      {
        contains: 7,
        exact: 10,
        prefix: 8,
        token: 1,
      },
    ) +
    sumSearchFieldScores([equipment.description], normalizedSearch, searchTokens, {
      contains: 2,
      exact: 3,
      prefix: 2,
      token: 0,
    })
  );
}

function createPublishedEquipmentSuggestion(equipment, locale, matchedAlias) {
  return {
    description: truncateSummary(
      matchedAlias
        ? `Alias match: ${matchedAlias}${equipment.description ? ` - ${equipment.description}` : ""}`
        : equipment.description || "Published equipment page",
    ),
    matchedAlias: matchedAlias || null,
    name: equipment.name,
    path: buildLocalizedPath(locale, publicRouteSegments.equipment(equipment.slug)),
    slug: equipment.slug,
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

function createLandingDiscoverySections(posts, entityKind, locale) {
  return publicEntityKinds
    .filter((kind) => kind !== entityKind)
    .map((kind) => ({
      items: tallyDiscoveryEntries(posts, kind, locale).slice(0, 4),
      kind,
    }))
    .filter((section) => section.items.length);
}

async function listPublishedPostsInternal(
  { locale = defaultLocale, page = 1, pageSize = publicListingPageSize } = {},
  prisma,
) {
  const resolvedLocale = normalizePublicLocale(locale);
  const requestedPage = normalizePositiveInteger(page);
  const resolvedPageSize = normalizePositiveInteger(pageSize, publicListingPageSize);
  const db = await resolvePrismaClient(prisma);
  const where = buildPublishedPostsWhere({
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
    locale: resolvedLocale,
    pagination,
    posts: posts.map((post) => createPublishedPostCard(post, resolvedLocale)),
    search: "",
  };
}

async function searchPublishedPostsInternal(
  { locale = defaultLocale, page = 1, pageSize = publicListingPageSize, search } = {},
  prisma,
) {
  const resolvedLocale = normalizePublicLocale(locale);
  const normalizedSearch = normalizeDisplayText(search) || "";

  if (!normalizedSearch) {
    return listPublishedPostsInternal(
      {
        locale: resolvedLocale,
        page,
        pageSize,
      },
      prisma,
    );
  }

  const requestedPage = normalizePositiveInteger(page);
  const resolvedPageSize = normalizePositiveInteger(pageSize, publicListingPageSize);
  const db = await resolvePrismaClient(prisma);
  const where = buildPublishedSearchWhere({
    locale: resolvedLocale,
    search: normalizedSearch,
  });
  const normalizedSearchValue = normalizeSearchValue(normalizedSearch);
  const searchTokens = dedupeStrings(normalizedSearchValue.split(" "));
  const matchingPosts = await db.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { slug: "asc" }],
    select: buildSearchPostSelect(resolvedLocale),
    where,
  });
  const rankedPosts = matchingPosts
    .map((post) => ({
      post,
      searchScore: buildWeightedSearchScore(post, resolvedLocale, normalizedSearchValue, searchTokens),
      tier: getSearchResultTier(post, resolvedLocale, normalizedSearchValue),
    }))
    .sort((left, right) => {
      if (left.tier !== right.tier) {
        return right.tier - left.tier;
      }

      if (left.tier === 1 && left.searchScore !== right.searchScore) {
        return right.searchScore - left.searchScore;
      }

      const publishedComparison = compareDatesDescending(left.post.publishedAt, right.post.publishedAt);

      if (publishedComparison !== 0) {
        return publishedComparison;
      }

      const updatedComparison = compareDatesDescending(left.post.updatedAt, right.post.updatedAt);

      if (updatedComparison !== 0) {
        return updatedComparison;
      }

      return createPublishedPostCard(left.post, resolvedLocale).title.localeCompare(
        createPublishedPostCard(right.post, resolvedLocale).title,
        undefined,
        {
          sensitivity: "base",
        },
      );
    })
    .map((entry) => createPublishedPostCard(entry.post, resolvedLocale));
  const pagination = createPagination(rankedPosts.length, requestedPage, resolvedPageSize);

  return {
    locale: resolvedLocale,
    pagination,
    posts: rankedPosts.slice(
      pagination.totalItems ? (pagination.currentPage - 1) * pagination.pageSize : 0,
      pagination.totalItems ? pagination.currentPage * pagination.pageSize : pagination.pageSize,
    ),
    search: normalizedSearch,
  };
}

async function searchPublishedEquipmentSuggestionsInternal(
  { limit = publicEquipmentSuggestionLimit, locale = defaultLocale, search } = {},
  prisma,
) {
  const resolvedLocale = normalizePublicLocale(locale);
  const resolvedLimit = normalizePositiveInteger(limit, publicEquipmentSuggestionLimit);
  const normalizedSearch = normalizeDisplayText(search) || "";

  if (normalizedSearch.length < 2) {
    return [];
  }

  const normalizedSearchValue = normalizeSearchValue(normalizedSearch);

  if (!normalizedSearchValue) {
    return [];
  }

  const db = await resolvePrismaClient(prisma);
  const matchingEquipment = await db.equipment.findMany({
    orderBy: [{ name: "asc" }, { slug: "asc" }],
    select: {
      aliases: {
        orderBy: {
          alias: "asc",
        },
        select: {
          alias: true,
        },
        take: 5,
      },
      description: true,
      name: true,
      slug: true,
    },
    take: Math.max(resolvedLimit * 4, 16),
    where: buildPublishedEquipmentSuggestionWhere({
      locale: resolvedLocale,
      search: normalizedSearch,
    }),
  });
  const searchTokens = dedupeStrings(normalizedSearchValue.split(" "));

  return matchingEquipment
    .map((equipment) => {
      const matchedAlias = findMatchedEquipmentAlias(equipment.aliases, normalizedSearchValue);

      return {
        score: buildEquipmentSuggestionScore(equipment, normalizedSearchValue, searchTokens),
        suggestion: createPublishedEquipmentSuggestion(equipment, resolvedLocale, matchedAlias),
        tier: getEquipmentSuggestionTier(equipment, matchedAlias, normalizedSearchValue),
      };
    })
    .sort((left, right) => {
      if (left.tier !== right.tier) {
        return right.tier - left.tier;
      }

      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return left.suggestion.name.localeCompare(right.suggestion.name, undefined, {
        sensitivity: "base",
      });
    })
    .slice(0, resolvedLimit)
    .map((entry) => entry.suggestion);
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
    select: buildDiscoveryPostSelect(),
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
  const discoveryPosts = totalItems
    ? await db.post.findMany({
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        select: buildDiscoveryPostSelect(),
        where,
      })
    : [];

  return {
    discoverySections: createLandingDiscoverySections(discoveryPosts, entityKind, resolvedLocale),
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

function buildRelatedPostOverlapCount(post, { categoryIds, equipmentId, manufacturerIds, tagIds }) {
  const sharedCategoryCount = post.categories.filter(({ category }) => categoryIds.has(category.id)).length;
  const sharedManufacturerCount = post.manufacturers.filter(({ manufacturer }) =>
    manufacturerIds.has(manufacturer.id),
  ).length;
  const sharedTagCount = post.tags.filter(({ tag }) => tagIds.has(tag.id)).length;
  const sameEquipment = post.equipment.id === equipmentId ? 1 : 0;

  return sameEquipment + sharedCategoryCount + sharedManufacturerCount + sharedTagCount;
}

async function listRelatedPublishedPostsInternal(
  { limit = 3, locale = defaultLocale, post } = {},
  prisma,
) {
  const resolvedLocale = normalizePublicLocale(locale);
  const resolvedLimit = normalizePositiveInteger(limit, 3);

  if (!post?.id || !post?.equipment?.id) {
    return [];
  }

  const categoryIds = new Set(post.categories.map(({ category }) => category.id));
  const manufacturerIds = new Set(post.manufacturers.map(({ manufacturer }) => manufacturer.id));
  const tagIds = new Set(post.tags.map(({ tag }) => tag.id));
  const db = await resolvePrismaClient(prisma);
  const relatedCandidates = await db.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    select: buildRelatedPostSelect(supportedLocales),
    take: Math.max(resolvedLimit * 6, 12),
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
        tagIds.size
          ? {
              tags: {
                some: {
                  tagId: {
                    in: [...tagIds],
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
          locale: {
            in: supportedLocales,
          },
        },
      },
    },
  });

  return relatedCandidates
    .map((candidate) => ({
      localeMatch: candidate.translations.some((entry) => entry.locale === resolvedLocale) ? 1 : 0,
      overlapCount: buildRelatedPostOverlapCount(candidate, {
        categoryIds,
        equipmentId: post.equipment.id,
        manufacturerIds,
        tagIds,
      }),
      post: createPublishedPostCard(candidate, resolvedLocale),
    }))
    .sort((left, right) => {
      if (left.localeMatch !== right.localeMatch) {
        return right.localeMatch - left.localeMatch;
      }

      if (left.overlapCount !== right.overlapCount) {
        return right.overlapCount - left.overlapCount;
      }

      const publishedComparison = compareDatesDescending(left.post.publishedAt, right.post.publishedAt);

      if (publishedComparison !== 0) {
        return publishedComparison;
      }

      return compareDatesDescending(left.post.updatedAt, right.post.updatedAt);
    })
    .slice(0, resolvedLimit)
    .map((entry) => entry.post);
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
        select: createPublicMediaImageSelect(),
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
      tags: {
        orderBy: {
          tag: {
            name: "asc",
          },
        },
        select: {
          tag: {
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
          locale: true,
          seoRecord: {
            select: {
              authorsJson: true,
              canonicalUrl: true,
              keywordsJson: true,
              metaDescription: true,
              metaTitle: true,
              noindex: true,
              ogDescription: true,
              ogImage: {
                select: createPublicMediaImageSelect(),
              },
              ogTitle: true,
              twitterDescription: true,
              twitterTitle: true,
            },
          },
          structuredContentJson: true,
          title: true,
          updatedAt: true,
        },
        where: {
          locale: {
            in: supportedLocales,
          },
        },
      },
      updatedAt: true,
    },
    where: {
      slug,
    },
  });

  const translation = post?.translations.find((entry) => entry.locale === resolvedLocale) || null;

  if (!post || post.status !== PostStatus.PUBLISHED || !translation || !post.publishedAt) {
    return null;
  }

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
  const relatedPosts = await listRelatedPublishedPostsInternal(
    {
      limit: 3,
      locale: resolvedLocale,
      post,
    },
    db,
  );

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
        authors: normalizeJsonStringList(translation.seoRecord?.authorsJson),
        description: translation.seoRecord?.metaDescription || translation.excerpt || post.excerpt || "",
        keywords: normalizeJsonStringList(translation.seoRecord?.keywordsJson),
        noindex: Boolean(translation.seoRecord?.noindex),
        ogDescription:
          translation.seoRecord?.ogDescription ||
          translation.seoRecord?.metaDescription ||
          translation.excerpt ||
          post.excerpt ||
          "",
        ogImage: createMediaImage(
          translation.seoRecord?.ogImage,
          translation.seoRecord?.ogTitle || translation.title,
        ),
        ogTitle: translation.seoRecord?.ogTitle || translation.seoRecord?.metaTitle || translation.title,
        title: translation.seoRecord?.metaTitle || translation.title,
        twitterDescription:
          translation.seoRecord?.twitterDescription ||
          translation.seoRecord?.ogDescription ||
          translation.seoRecord?.metaDescription ||
          translation.excerpt ||
          post.excerpt ||
          "",
        twitterTitle:
          translation.seoRecord?.twitterTitle ||
          translation.seoRecord?.ogTitle ||
          translation.seoRecord?.metaTitle ||
          translation.title,
      },
      availableLocales: dedupeStrings(post.translations.map((entry) => entry.locale)),
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

const getCachedPublishedSearchResults = unstable_cache(
  async (locale, page, pageSize, search) =>
    searchPublishedPostsInternal({ locale, page, pageSize, search }),
  ["public-search-data"],
  {
    revalidate: publicDataRevalidateSeconds,
  },
);

const getCachedPublishedEquipmentSuggestions = unstable_cache(
  async (limit, locale, search) =>
    searchPublishedEquipmentSuggestionsInternal({ limit, locale, search }),
  ["public-equipment-suggestion-data"],
  {
    revalidate: publicDataRevalidateSeconds,
  },
);

export async function listPublishedPosts(options = {}, prisma) {
  if (normalizeDisplayText(options.search)) {
    return searchPublishedPosts(options, prisma);
  }

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

export async function searchPublishedPosts(options = {}, prisma) {
  if (prisma) {
    return searchPublishedPostsInternal(options, prisma);
  }

  return getCachedPublishedSearchResults(
    normalizePublicLocale(options.locale),
    normalizePositiveInteger(options.page),
    normalizePositiveInteger(options.pageSize, publicListingPageSize),
    normalizeDisplayText(options.search) || "",
  );
}

export async function searchPublishedEquipmentSuggestions(options = {}, prisma) {
  if (prisma) {
    return searchPublishedEquipmentSuggestionsInternal(options, prisma);
  }

  return getCachedPublishedEquipmentSuggestions(
    normalizePositiveInteger(options.limit, publicEquipmentSuggestionLimit),
    normalizePublicLocale(options.locale),
    normalizeDisplayText(options.search) || "",
  );
}

export async function getPublishedHomePageData(options = {}, prisma) {
  return getPublishedHomePageDataInternal(
    {
      ...options,
      locale: normalizePublicLocale(options.locale),
    },
    prisma,
  );
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

export async function listRelatedPublishedPosts(options = {}, prisma) {
  return listRelatedPublishedPostsInternal(options, prisma);
}
