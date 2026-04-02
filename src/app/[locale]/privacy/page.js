import PlaceholderPage from "@/components/common/placeholder-page";

export default async function PrivacyPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[`/${locale}/privacy`, "Public legal page"]}
      description="The privacy policy route is scaffolded and ready for locale-aware legal content."
      eyebrow="Privacy policy"
      notes={[
        "Document analytics, comments, and moderation data handling.",
        "Explain guest comment data retention.",
        "Maintain locale-prefixed canonical URLs.",
      ]}
      title="Privacy policy"
    />
  );
}
