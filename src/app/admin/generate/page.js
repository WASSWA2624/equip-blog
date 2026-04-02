import PlaceholderPage from "@/components/common/placeholder-page";

export default function GeneratePage() {
  return (
    <PlaceholderPage
      badges={["/admin/generate", "Generator workflow"]}
      description="The Generate Post route is scaffolded for the future source-grounded draft workflow."
      eyebrow="Generate post"
      notes={[
        "Capture equipment name, depth, audience, and toggles.",
        "Block duplicates before generation proceeds.",
        "Surface generation progress from Redux state.",
      ]}
      title="Generate a new draft"
    />
  );
}
