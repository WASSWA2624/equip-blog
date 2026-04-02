import PlaceholderPage from "@/components/common/placeholder-page";
import { buildLocalizedPath, buildPublicPageMetadata, publicRouteSegments } from "@/features/i18n/routing";

const description =
  "Equipment landing pages are scaffolded so later steps can attach generated, reviewed, and published equipment content.";

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const title = `Equipment scaffold: ${slug}`;

  return buildPublicPageMetadata({
    description,
    locale,
    segments: publicRouteSegments.equipment(slug),
    title,
  });
}

export default async function EquipmentPage({ params }) {
  const { locale, slug } = await params;
  const title = `Equipment scaffold: ${slug}`;

  return (
    <PlaceholderPage
      badges={[buildLocalizedPath(locale, publicRouteSegments.equipment(slug)), "Discovery page"]}
      description={description}
      eyebrow="Equipment"
      notes={[
        "Render published equipment-focused posts and metadata.",
        "Add related content and search hooks.",
        "Preserve locale-aware URL structure.",
      ]}
      title={title}
    />
  );
}
