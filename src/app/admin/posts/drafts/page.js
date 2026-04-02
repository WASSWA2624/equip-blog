import PlaceholderPage from "@/components/common/placeholder-page";

export default function DraftsPage() {
  return (
    <PlaceholderPage
      badges={["/admin/posts/drafts", "Protected list"]}
      description="This drafts list placeholder preserves the route for editorial work-in-progress content."
      eyebrow="Drafts"
      notes={[
        "List draft posts with locale-aware metadata.",
        "Connect filters and RTK Query data loading.",
        "Link into the editor route.",
      ]}
      title="Draft posts"
    />
  );
}
