import { PublicStaticPage } from "@/components/public";
import { getMessages } from "@/features/i18n/get-messages";
import { buildPublicPageMetadata, publicRouteSegments } from "@/features/i18n/routing";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const messages = await getMessages(locale);
  const pageContent = messages?.public?.pages?.disclaimer || {};

  return buildPublicPageMetadata({
    description: pageContent.metaDescription || pageContent.description || messages.site.tagline,
    locale,
    segments: publicRouteSegments.disclaimer,
    title: pageContent.metaTitle || pageContent.title || messages.site.title,
  });
}

export default async function DisclaimerPage({ params }) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return <PublicStaticPage pageContent={messages.public?.pages?.disclaimer || {}} />;
}
