import { PublicCollectionPage } from "@/components/public";
import { getMessages } from "@/features/i18n/get-messages";
import { buildLocalizedPath, buildPublicPageMetadata, publicRouteSegments } from "@/features/i18n/routing";
import { listPublishedPosts } from "@/features/public-site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const messages = await getMessages(locale);
  const pageContent = messages?.public?.blog || {};

  return buildPublicPageMetadata({
    description: pageContent.metaDescription || pageContent.description || messages.site.tagline,
    locale,
    segments: publicRouteSegments.blog,
    title: pageContent.metaTitle || pageContent.title || messages.site.title,
  });
}

export default async function BlogIndexPage({ params, searchParams }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page;
  const [messages, pageData] = await Promise.all([
    getMessages(locale),
    listPublishedPosts({ locale, page }),
  ]);

  return (
    <PublicCollectionPage
      locale={locale}
      messages={messages.public}
      pageContent={messages.public?.blog || {}}
      pageData={pageData}
      pathname={buildLocalizedPath(locale, publicRouteSegments.blog)}
      query={{}}
    />
  );
}
