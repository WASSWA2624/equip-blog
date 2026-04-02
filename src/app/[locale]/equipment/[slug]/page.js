import PlaceholderPage from "@/components/common/placeholder-page";

export default async function EquipmentPage({ params }) {
  const { locale, slug } = await params;

  return (
    <PlaceholderPage
      badges={[`/${locale}/equipment/${slug}`, "Discovery page"]}
      description="Equipment landing pages are scaffolded so later steps can attach generated, reviewed, and published equipment content."
      eyebrow="Equipment"
      notes={[
        "Render published equipment-focused posts and metadata.",
        "Add related content and search hooks.",
        "Preserve locale-aware URL structure.",
      ]}
      title={`Equipment scaffold: ${slug}`}
    />
  );
}
