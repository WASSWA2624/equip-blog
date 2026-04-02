import PlaceholderPage from "@/components/common/placeholder-page";

export default function SeoPage() {
  return (
    <PlaceholderPage
      badges={["/admin/seo", "Management"]}
      description="The SEO route is scaffolded for metadata, robots, sitemap, and structured data management."
      eyebrow="SEO management"
      notes={[
        "Manage metadata defaults and overrides.",
        "Review sitemap and robots policies.",
        "Support Open Graph and Twitter assets.",
      ]}
      title="SEO management"
    />
  );
}
