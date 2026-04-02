import PlaceholderPage from "@/components/common/placeholder-page";

export default async function PostEditorPage({ params }) {
  const { id } = await params;

  return (
    <PlaceholderPage
      badges={[`/admin/posts/${id}`, "Editor route"]}
      description="The post editor route exists and is ready for draft review, schedule confirmation, and manual publish actions."
      eyebrow="Post editor"
      notes={[
        "Load draft data and editorial workflow state.",
        "Support Markdown, HTML, and structured JSON editing paths.",
        "Keep publish and editorial stages separate.",
      ]}
      title={`Editor scaffold: ${id}`}
    />
  );
}
