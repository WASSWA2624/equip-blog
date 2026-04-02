import PlaceholderPage from "@/components/common/placeholder-page";

export default function JobsPage() {
  return (
    <PlaceholderPage
      badges={["/admin/jobs", "Logs"]}
      description="The jobs and generation logs route is scaffolded for operational visibility."
      eyebrow="Jobs"
      notes={[
        "Display generation and publish job history.",
        "Expose retry and status details later.",
        "Keep admin access protected.",
      ]}
      title="Job and generation logs"
    />
  );
}
