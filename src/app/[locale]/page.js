import PlaceholderPage from "@/components/common/placeholder-page";

export default async function LocaleHomePage({ params }) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      badges={[`/${locale}`, "Public home", "Locale-ready"]}
      description="This public landing page is scaffolded for the English-first release and future locale expansion."
      eyebrow={`${locale.toUpperCase()} public route`}
      notes={[
        "Introduce featured posts and discovery sections.",
        "Render published content only.",
        "Pull labels and legal copy from locale messages.",
      ]}
      title="Equip Blog home"
    />
  );
}
