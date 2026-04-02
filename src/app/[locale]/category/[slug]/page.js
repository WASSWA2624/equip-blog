import PlaceholderPage from "@/components/common/placeholder-page";
import { buildLocalizedPath, buildPublicPageMetadata, publicRouteSegments } from "@/features/i18n/routing";

const description =
  "Category landing pages are scaffolded for topic discovery and locale-aware indexing.";

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const title = `Category scaffold: ${slug}`;

  return buildPublicPageMetadata({
    description,
    locale,
    segments: publicRouteSegments.category(slug),
    title,
  });
}

export default async function CategoryPage({ params }) {
  const { locale, slug } = await params;
  const title = `Category scaffold: ${slug}`;

  return (
    <PlaceholderPage
      badges={[buildLocalizedPath(locale, publicRouteSegments.category(slug)), "Discovery page"]}
      description={description}
      eyebrow="Category"
      notes={[
        "List published posts in the selected category.",
        "Add SEO descriptions and related taxonomy links.",
        "Stay read-only on the public surface.",
      ]}
      title={title}
    />
  );
}
