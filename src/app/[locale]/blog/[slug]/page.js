import { notFound } from "next/navigation";

import { PublicPostPage } from "@/components/public";
import { StructuredDataBundle } from "@/components/seo";
import { getMessages } from "@/features/i18n/get-messages";
import { publicRouteSegments } from "@/features/i18n/routing";
import { getPublishedPostPageData } from "@/features/public-site";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPageMetadata,
  extractFaqItemsFromSections,
} from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const pageData = await getPublishedPostPageData({
    locale,
    slug,
  });

  if (!pageData) {
    return {};
  }

  return buildPageMetadata({
    authors: pageData.article.metadata.authors,
    canonicalUrl: pageData.article.url,
    description: pageData.article.metadata.description,
    image: pageData.article.metadata.ogImage || pageData.article.heroImages[0] || null,
    locale,
    locales: pageData.article.availableLocales,
    modifiedTime: pageData.article.updatedAt,
    noindex: pageData.article.metadata.noindex,
    openGraphDescription: pageData.article.metadata.ogDescription,
    openGraphTitle: pageData.article.metadata.ogTitle,
    publishedTime: pageData.article.publishedAt,
    segments: publicRouteSegments.blogPost(slug),
    title: pageData.article.metadata.title,
    twitterDescription: pageData.article.metadata.twitterDescription,
    twitterTitle: pageData.article.metadata.twitterTitle,
    type: "article",
    keywords: pageData.article.metadata.keywords,
  });
}

export default async function BlogPostPage({ params, searchParams }) {
  const { locale, slug } = await params;
  const resolvedSearchParams = await searchParams;
  const commentsPage = resolvedSearchParams?.commentsPage;
  const [messages, pageData] = await Promise.all([
    getMessages(locale),
    getPublishedPostPageData({
      commentsPage,
      locale,
      slug,
    }),
  ]);

  if (!pageData) {
    notFound();
  }

  return (
    <>
      <StructuredDataBundle
        idPrefix={`post-${pageData.article.slug || slug}`}
        items={[
          buildBreadcrumbJsonLd(pageData.article.breadcrumb),
          buildArticleJsonLd({
            article: pageData.article,
            locale,
          }),
          buildFaqJsonLd(extractFaqItemsFromSections(pageData.article.bodySections)),
        ]}
      />
      <PublicPostPage locale={locale} messages={messages.public} pageData={pageData} />
    </>
  );
}
