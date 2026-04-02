import PlaceholderPage from "@/components/common/placeholder-page";
import {
  buildLocalizedPath,
  buildPublicPageMetadata,
  publicRouteSegments,
} from "@/features/i18n/routing";

const title = "Equip Blog home";
const description =
  "This public landing page is scaffolded for the English-first release and future locale expansion.";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return buildPublicPageMetadata({
    description,
    locale,
    segments: publicRouteSegments.home,
    title,
  });
}

export default async function LocaleHomePage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[buildLocalizedPath(locale, publicRouteSegments.home), "Public home", "Locale-ready"]}
      description={description}
      eyebrow={`${locale.toUpperCase()} public route`}
      notes={[
        "Introduce featured posts and discovery sections.",
        "Render published content only.",
        "Pull labels and legal copy from locale messages.",
      ]}
      title={title}
    />
  );
}
