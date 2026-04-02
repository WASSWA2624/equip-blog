import PlaceholderPage from "@/components/common/placeholder-page";

export default async function BlogPostPage({ params }) {
  const { locale, slug } = await params;

  return (
    <PlaceholderPage
      badges={[`/${locale}/blog/${slug}`, "Published content", "Comments"]}
      description="Each individual article route exists now so later steps can plug in rendered HTML, share actions, and moderated comments."
      eyebrow="Blog post"
      notes={[
        "Load only published post translations.",
        "Attach comments and share actions.",
        "Render stored Markdown, HTML, and structured JSON artifacts.",
      ]}
      title={`Post scaffold: ${slug}`}
    />
  );
}
