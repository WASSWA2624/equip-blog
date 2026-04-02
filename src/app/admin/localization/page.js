import PlaceholderPage from "@/components/common/placeholder-page";

export default function LocalizationPage() {
  return (
    <PlaceholderPage
      badges={["/admin/localization", "Management"]}
      description="The localization route is available for future locale enablement and translation operations."
      eyebrow="Localization"
      notes={[
        "Register new supported locales in configuration.",
        "Manage locale-specific admin and public copy.",
        "Preserve the locale-ready routing foundation.",
      ]}
      title="Localization management"
    />
  );
}
