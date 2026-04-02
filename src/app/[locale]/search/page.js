import PlaceholderPage from "@/components/common/placeholder-page";
import {
  buildLocalizedPath,
  buildPublicPageMetadata,
  publicRouteSegments,
} from "@/features/i18n/routing";

const title = "Search published content";
const description =
  "The search page route is present and ready for locale-aware published-content search.";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return buildPublicPageMetadata({
    description,
    locale,
    segments: publicRouteSegments.search,
    title,
  });
}

export default async function SearchPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[buildLocalizedPath(locale, publicRouteSegments.search), "Public discovery"]}
      description={description}
      eyebrow="Search"
      notes={[
        "Wire database-backed search in the active locale.",
        "Return published results only.",
        "Expose filters and ranking refinements.",
      ]}
      title={title}
    />
  );
}
