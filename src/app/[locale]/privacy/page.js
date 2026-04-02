import PlaceholderPage from "@/components/common/placeholder-page";
import {
  buildLocalizedPath,
  buildPublicPageMetadata,
  publicRouteSegments,
} from "@/features/i18n/routing";

const title = "Privacy policy";
const description = "The privacy policy route is scaffolded and ready for locale-aware legal content.";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return buildPublicPageMetadata({
    description,
    locale,
    segments: publicRouteSegments.privacy,
    title,
  });
}

export default async function PrivacyPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[buildLocalizedPath(locale, publicRouteSegments.privacy), "Public legal page"]}
      description={description}
      eyebrow="Privacy policy"
      notes={[
        "Document analytics, comments, and moderation data handling.",
        "Explain guest comment data retention.",
        "Maintain locale-prefixed canonical URLs.",
      ]}
      title={title}
    />
  );
}
