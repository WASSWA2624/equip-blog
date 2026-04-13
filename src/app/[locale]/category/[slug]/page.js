import { notFound } from "next/navigation";

import { PublicCollectionPage } from "@/components/public";
import { getMessages } from "@/features/i18n/get-messages";
import { publicRouteSegments } from "@/features/i18n/routing";
import { getPublishedLandingPageData } from "@/features/public-site";
import {
  buildEntityArchiveDescription,
  buildEntityArchivePageContent,
  buildEntityArchiveTitle,
} from "@/lib/seo/entity-archives";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({ params, searchParams }) {
  const { locale, slug } = await params;
  const resolvedSearchParams = await searchParams;
  const messages = await getMessages(locale);
  const pageData = await getPublishedLandingPageData({
    entityKind: "category",
    locale,
    slug,
  });
  const page = Number.parseInt(`${resolvedSearchParams?.page ?? ""}`.trim(), 10);
  const title = buildEntityArchiveTitle("category", pageData?.entity);

  return buildPageMetadata({
    description:
      buildEntityArchiveDescription({
        entity: pageData?.entity,
        entityKind: "category",
        totalItems: pageData?.pagination?.totalItems || 0,
      }) ||
      messages.public?.home?.discoveryDescription ||
      messages.site.tagline,
    locale,
    query: Number.isFinite(page) && page > 1 ? { page } : undefined,
    segments: publicRouteSegments.category(slug),
    title,
  });
}

export default async function CategoryPage({ params, searchParams }) {
  const { locale, slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page;
  const [messages, pageData] = await Promise.all([
    getMessages(locale),
    getPublishedLandingPageData({
      entityKind: "category",
      locale,
      page,
      slug,
    }),
  ]);

  if (!pageData) {
    notFound();
  }

  return (
    <PublicCollectionPage
      entity={pageData.entity}
      locale={locale}
      messages={messages.public}
      pageContent={buildEntityArchivePageContent({
        entity: pageData.entity,
        entityKind: "category",
        totalItems: pageData.pagination.totalItems,
      })}
      pageData={pageData}
      pathname={pageData.entity.path}
      query={{}}
    />
  );
}
