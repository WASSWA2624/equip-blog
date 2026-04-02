import PlaceholderPage from "@/components/common/placeholder-page";

export default async function AboutPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[`/${locale}/about`, "Public page"]}
      description="The About page placeholder keeps the locale-prefixed route inventory in place for Release 1."
      eyebrow="About"
      notes={[
        "Add mission, editorial policy, and trust messaging.",
        "Reference source-grounded generation rules.",
        "Keep locale-specific copy in message files where appropriate.",
      ]}
      title="About Equip Blog"
    />
  );
}
