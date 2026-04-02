import PlaceholderPage from "@/components/common/placeholder-page";
import {
  buildLocalizedPath,
  buildPublicPageMetadata,
  publicRouteSegments,
} from "@/features/i18n/routing";

const title = "Blog index";
const description =
  "This blog index placeholder preserves the route where published locale-specific content will be listed.";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return buildPublicPageMetadata({
    description,
    locale,
    segments: publicRouteSegments.blog,
    title,
  });
}

export default async function BlogIndexPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[buildLocalizedPath(locale, publicRouteSegments.blog), "Published content only"]}
      description={description}
      eyebrow="Blog index"
      notes={[
        "Render published posts for the active locale.",
        "Add pagination and filters.",
        "Integrate SEO metadata and discovery sections.",
      ]}
      title={title}
    />
  );
}
