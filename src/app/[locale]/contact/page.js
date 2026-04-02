import PlaceholderPage from "@/components/common/placeholder-page";
import {
  buildLocalizedPath,
  buildPublicPageMetadata,
  publicRouteSegments,
} from "@/features/i18n/routing";

const title = "Contact the editorial team";
const description =
  "This scaffolded contact route will later host the validated contact form and support details.";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return buildPublicPageMetadata({
    description,
    locale,
    segments: publicRouteSegments.contact,
    title,
  });
}

export default async function ContactPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[buildLocalizedPath(locale, publicRouteSegments.contact), "Public page"]}
      description={description}
      eyebrow="Contact"
      notes={[
        "Add contact submission handling and validation.",
        "Introduce anti-spam protections.",
        "Connect locale-aware success and error copy.",
      ]}
      title={title}
    />
  );
}
