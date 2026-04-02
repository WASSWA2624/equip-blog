import { publicRouteSegments, buildLocalizedPath } from "@/features/i18n/routing";
import { env } from "@/lib/env/server";

function dedupeStrings(values) {
  return [...new Set(values.map((value) => `${value}`.trim()).filter(Boolean))];
}

function createMetaDescription(article) {
  const source = [article.excerpt, ...(article.sections || []).flatMap((section) => section.paragraphs || [])]
    .find(Boolean) || "";

  return source.length > 160 ? `${source.slice(0, 157).trim()}...` : source;
}

export function buildSeoPayload(article, { locale = "en", ogImageId = null } = {}) {
  const canonicalPath = buildLocalizedPath(locale, publicRouteSegments.blogPost(article.slug));
  const canonicalUrl = `${env.app.url}${canonicalPath}`;
  const keywords = dedupeStrings([
    article.equipmentName,
    ...(article.equipmentAliases || []),
    ...(article.relatedKeywords || []),
    ...(article.sections
      .filter((section) => section.kind === "models_by_manufacturer")
      .flatMap((section) => section.groups.map((group) => group.manufacturer))),
  ]);
  const metaDescription = createMetaDescription(article);

  return {
    authors: ["Equip Blog Editorial"],
    canonicalUrl,
    keywords,
    metaDescription,
    metaTitle: article.title,
    noindex: false,
    ogDescription: metaDescription,
    ogImageId,
    ogTitle: article.title,
    twitterDescription: metaDescription,
    twitterTitle: article.title,
  };
}
