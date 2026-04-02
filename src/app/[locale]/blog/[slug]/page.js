import PlaceholderPage from "@/components/common/placeholder-page";
import { buildLocalizedPath, buildPublicPageMetadata, publicRouteSegments } from "@/features/i18n/routing";

const description =
  "Each individual article route exists now so later steps can plug in rendered HTML, share actions, and moderated comments.";

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const title = `Post scaffold: ${slug}`;

  return buildPublicPageMetadata({
    description,
    locale,
    segments: publicRouteSegments.blogPost(slug),
    title,
  });
}

export default async function BlogPostPage({ params }) {
  const { locale, slug } = await params;
  const title = `Post scaffold: ${slug}`;

  return (
    <PlaceholderPage
      badges={[
        buildLocalizedPath(locale, publicRouteSegments.blogPost(slug)),
        "Published content",
        "Comments",
      ]}
      description={description}
      eyebrow="Blog post"
      notes={[
        "Load only published post translations.",
        "Attach comments and share actions.",
        "Render stored Markdown, HTML, and structured JSON artifacts.",
      ]}
      title={title}
    />
  );
}
