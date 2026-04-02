import PlaceholderPage from "@/components/common/placeholder-page";

export default function SourcesPage() {
  return (
    <PlaceholderPage
      badges={["/admin/sources", "Configuration"]}
      description="The source configuration route is scaffolded for approved-source management and auditability."
      eyebrow="Sources"
      notes={[
        "Manage approved source tiers and settings.",
        "Restrict sensitive changes by role.",
        "Support source-grounded draft generation.",
      ]}
      title="Source configuration"
    />
  );
}
