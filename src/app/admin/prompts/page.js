import PlaceholderPage from "@/components/common/placeholder-page";

export default function PromptsPage() {
  return (
    <PlaceholderPage
      badges={["/admin/prompts", "Configuration"]}
      description="Prompt configuration has a dedicated route now so later steps can add editor-managed templates."
      eyebrow="Prompts"
      notes={[
        "Store and version writing prompts.",
        "Restrict changes to authorized roles.",
        "Tie prompt selection to the generation workflow.",
      ]}
      title="Prompt configuration"
    />
  );
}
