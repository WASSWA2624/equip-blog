import { PublicCollectionPage } from "@/components/public";
import { getMessages } from "@/features/i18n/get-messages";
import { buildLocalizedPath, buildPublicPageMetadata, publicRouteSegments } from "@/features/i18n/routing";
import { listPublishedPosts } from "@/features/public-site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const messages = await getMessages(locale);
  const pageContent = messages?.public?.search || {};

  return buildPublicPageMetadata({
    description: pageContent.metaDescription || pageContent.description || messages.site.tagline,
    locale,
    segments: publicRouteSegments.search,
    title: pageContent.metaTitle || pageContent.title || messages.site.title,
  });
}

export default async function SearchPage({ params, searchParams }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page;
  const query = resolvedSearchParams?.q;
  const [messages, pageData] = await Promise.all([
    getMessages(locale),
    listPublishedPosts({ locale, page, search: query }),
  ]);

  return (
    <PublicCollectionPage
      locale={locale}
      messages={messages.public}
      pageContent={messages.public?.search || {}}
      pageData={pageData}
      pathname={buildLocalizedPath(locale, publicRouteSegments.search)}
      query={query ? { q: query } : {}}
      showSearch
    />
  );
}
