import PlaceholderPage from "@/components/common/placeholder-page";

export default function CommentsPage() {
  return (
    <PlaceholderPage
      badges={["/admin/comments", "Moderation"]}
      description="This comments moderation route is scaffolded for the guest comment review workflow."
      eyebrow="Comments moderation"
      notes={[
        "Review pending guest comments.",
        "Add moderation filters and bulk actions.",
        "Connect rate-limited submission and moderation APIs.",
      ]}
      title="Moderate comments"
    />
  );
}
