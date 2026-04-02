import PlaceholderPage from "@/components/common/placeholder-page";
import {
  buildLocalizedPath,
  buildPublicPageMetadata,
  publicRouteSegments,
} from "@/features/i18n/routing";

const title = "Disclaimer";
const description =
  "The medical and educational disclaimer route is present so legal copy can be added without changing structure.";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return buildPublicPageMetadata({
    description,
    locale,
    segments: publicRouteSegments.disclaimer,
    title,
  });
}

export default async function DisclaimerPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[buildLocalizedPath(locale, publicRouteSegments.disclaimer), "Public legal page"]}
      description={description}
      eyebrow="Disclaimer"
      notes={[
        "Add release-ready educational-use disclaimer text.",
        "Keep locale-specific legal copy isolated from route structure.",
        "Link to related privacy and contact surfaces.",
      ]}
      title={title}
    />
  );
}
