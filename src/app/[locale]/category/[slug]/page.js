import PlaceholderPage from "@/components/common/placeholder-page";

export default async function CategoryPage({ params }) {
  const { locale, slug } = await params;

  return (
    <PlaceholderPage
      badges={[`/${locale}/category/${slug}`, "Discovery page"]}
      description="Category landing pages are scaffolded for topic discovery and locale-aware indexing."
      eyebrow="Category"
      notes={[
        "List published posts in the selected category.",
        "Add SEO descriptions and related taxonomy links.",
        "Stay read-only on the public surface.",
      ]}
      title={`Category scaffold: ${slug}`}
    />
  );
}
