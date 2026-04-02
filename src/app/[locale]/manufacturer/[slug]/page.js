import PlaceholderPage from "@/components/common/placeholder-page";
import { buildLocalizedPath, buildPublicPageMetadata, publicRouteSegments } from "@/features/i18n/routing";

const description =
  "Manufacturer landing pages are present and ready for published topical content.";

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const title = `Manufacturer scaffold: ${slug}`;

  return buildPublicPageMetadata({
    description,
    locale,
    segments: publicRouteSegments.manufacturer(slug),
    title,
  });
}

export default async function ManufacturerPage({ params }) {
  const { locale, slug } = await params;
  const title = `Manufacturer scaffold: ${slug}`;

  return (
    <PlaceholderPage
      badges={[
        buildLocalizedPath(locale, publicRouteSegments.manufacturer(slug)),
        "Discovery page",
      ]}
      description={description}
      eyebrow="Manufacturer"
      notes={[
        "Show manufacturer-specific posts and model references.",
        "Support SEO landing page metadata.",
        "Keep public pages strictly read-only.",
      ]}
      title={title}
    />
  );
}
