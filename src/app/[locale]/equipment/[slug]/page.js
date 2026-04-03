import { notFound } from "next/navigation";

import { PublicCollectionPage } from "@/components/public";
import { getMessages } from "@/features/i18n/get-messages";
import { buildPublicPageMetadata, publicRouteSegments } from "@/features/i18n/routing";
import { getPublishedLandingPageData } from "@/features/public-site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const messages = await getMessages(locale);
  const pageData = await getPublishedLandingPageData({
    entityKind: "equipment",
    locale,
    slug,
  });
  const title = pageData?.entity?.name
    ? `${pageData.entity.name} equipment`
    : messages.public?.common?.topEquipmentTitle || "Equipment";

  return buildPublicPageMetadata({
    description:
      pageData?.entity?.description || messages.public?.home?.discoveryDescription || messages.site.tagline,
    locale,
    segments: publicRouteSegments.equipment(slug),
    title,
  });
}

export default async function EquipmentPage({ params, searchParams }) {
  const { locale, slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page;
  const [messages, pageData] = await Promise.all([
    getMessages(locale),
    getPublishedLandingPageData({
      entityKind: "equipment",
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
      pageContent={{
        description: messages.public?.home?.discoveryDescription,
        eyebrow: messages.public?.common?.topEquipmentTitle || "Equipment",
        resultsTitle: messages.public?.blog?.resultsTitle,
        title: messages.public?.common?.topEquipmentTitle || "Equipment",
      }}
      pageData={pageData}
      pathname={pageData.entity.path}
      query={{}}
    />
  );
}
