import PlaceholderPage from "@/components/common/placeholder-page";

export default function AdminDashboardPage() {
  return (
    <PlaceholderPage
      badges={["/admin", "Protected route"]}
      description="The admin dashboard route is scaffolded and ready for authenticated editorial overview widgets."
      eyebrow="Dashboard"
      notes={[
        "Add jobs, content, and moderation summaries.",
        "Require authenticated admin access.",
        "Expose locale-ready labels from message files.",
      ]}
      title="Admin dashboard"
    />
  );
}
