import PlaceholderPage from "@/components/common/placeholder-page";

export default function MediaPage() {
  return (
    <PlaceholderPage
      badges={["/admin/media", "Management"]}
      description="The media library route is in place for the local-first storage abstraction defined in the architecture."
      eyebrow="Media library"
      notes={[
        "Upload and browse media assets.",
        "Support local storage now and S3-compatible storage later.",
        "Track media metadata for posts and SEO assets.",
      ]}
      title="Media library"
    />
  );
}
