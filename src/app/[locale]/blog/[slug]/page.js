import { notFound } from "next/navigation";

import { PublicPostPage } from "@/components/public";
import { getMessages } from "@/features/i18n/get-messages";
import { buildPublicPageMetadata, publicRouteSegments } from "@/features/i18n/routing";
import { getPublishedPostPageData } from "@/features/public-site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const pageData = await getPublishedPostPageData({
    locale,
    slug,
  });

  if (!pageData) {
    return {};
  }

  const heroImage = pageData.article.heroImages[0]?.url;
  const metadata = buildPublicPageMetadata({
    description: pageData.article.metadata.description,
    locale,
    segments: publicRouteSegments.blogPost(slug),
    title: pageData.article.metadata.title,
  });

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: pageData.article.url,
    },
    openGraph: {
      description: pageData.article.metadata.description,
      images: heroImage ? [{ url: heroImage }] : undefined,
      title: pageData.article.metadata.title,
      type: "article",
      url: pageData.article.url,
    },
    twitter: {
      card: heroImage ? "summary_large_image" : "summary",
      description: pageData.article.metadata.description,
      images: heroImage ? [heroImage] : undefined,
      title: pageData.article.metadata.title,
    },
  };
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

  return <PublicPostPage locale={locale} messages={messages.public} pageData={pageData} />;
}
