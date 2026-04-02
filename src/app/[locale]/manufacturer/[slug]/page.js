import PlaceholderPage from "@/components/common/placeholder-page";

export default async function ManufacturerPage({ params }) {
  const { locale, slug } = await params;

  return (
    <PlaceholderPage
      badges={[`/${locale}/manufacturer/${slug}`, "Discovery page"]}
      description="Manufacturer landing pages are present and ready for published topical content."
      eyebrow="Manufacturer"
      notes={[
        "Show manufacturer-specific posts and model references.",
        "Support SEO landing page metadata.",
        "Keep public pages strictly read-only.",
      ]}
      title={`Manufacturer scaffold: ${slug}`}
    />
  );
}
