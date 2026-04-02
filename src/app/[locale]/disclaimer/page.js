import PlaceholderPage from "@/components/common/placeholder-page";

export default async function DisclaimerPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[`/${locale}/disclaimer`, "Public legal page"]}
      description="The medical and educational disclaimer route is present so legal copy can be added without changing structure."
      eyebrow="Disclaimer"
      notes={[
        "Add release-ready educational-use disclaimer text.",
        "Keep locale-specific legal copy isolated from route structure.",
        "Link to related privacy and contact surfaces.",
      ]}
      title="Disclaimer"
    />
  );
}
