import PlaceholderPage from "@/components/common/placeholder-page";

export default async function SearchPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[`/${locale}/search`, "Public discovery"]}
      description="The search page route is present and ready for locale-aware published-content search."
      eyebrow="Search"
      notes={[
        "Wire database-backed search in the active locale.",
        "Return published results only.",
        "Expose filters and ranking refinements.",
      ]}
      title="Search published content"
    />
  );
}
