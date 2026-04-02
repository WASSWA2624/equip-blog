import PlaceholderPage from "@/components/common/placeholder-page";

export default async function BlogIndexPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[`/${locale}/blog`, "Published content only"]}
      description="This blog index placeholder preserves the route where published locale-specific content will be listed."
      eyebrow="Blog index"
      notes={[
        "Render published posts for the active locale.",
        "Add pagination and filters.",
        "Integrate SEO metadata and discovery sections.",
      ]}
      title="Blog index"
    />
  );
}
