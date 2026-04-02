import PlaceholderPage from "@/components/common/placeholder-page";

export default async function ContactPage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[`/${locale}/contact`, "Public page"]}
      description="This scaffolded contact route will later host the validated contact form and support details."
      eyebrow="Contact"
      notes={[
        "Add contact submission handling and validation.",
        "Introduce anti-spam protections.",
        "Connect locale-aware success and error copy.",
      ]}
      title="Contact the editorial team"
    />
  );
}
