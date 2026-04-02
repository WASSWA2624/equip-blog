import PlaceholderPage from "@/components/common/placeholder-page";

export default function PublishedPostsPage() {
  return (
    <PlaceholderPage
      badges={["/admin/posts/published", "Protected list"]}
      description="The published posts list route is scaffolded for the editorial inventory of live content."
      eyebrow="Published posts"
      notes={[
        "List published posts and status metadata.",
        "Support unpublish and archive workflows later.",
        "Expose localized admin labels from messages.",
      ]}
      title="Published posts"
    />
  );
}
