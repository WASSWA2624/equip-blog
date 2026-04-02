import PlaceholderPage from "@/components/common/placeholder-page";
import {
  buildLocalizedPath,
  buildPublicPageMetadata,
  publicRouteSegments,
} from "@/features/i18n/routing";

const title = "About Equip Blog";
const description =
  "The About page placeholder keeps the locale-prefixed route inventory in place for Release 1.";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return buildPublicPageMetadata({
    description,
    locale,
    segments: publicRouteSegments.about,
    title,
  });
}

export default async function AboutPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[buildLocalizedPath(locale, publicRouteSegments.about), "Public page"]}
      description={description}
      eyebrow="About"
      notes={[
        "Add mission, editorial policy, and trust messaging.",
        "Reference source-grounded generation rules.",
        "Keep locale-specific copy in message files where appropriate.",
      ]}
      title={title}
    />
  );
}
