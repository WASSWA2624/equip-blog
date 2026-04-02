import PlaceholderPage from "@/components/common/placeholder-page";

export default function CategoriesPage() {
  return (
    <PlaceholderPage
      badges={["/admin/categories", "Management"]}
      description="The categories management route is available for future taxonomy administration."
      eyebrow="Categories"
      notes={[
        "Manage category metadata and slugs.",
        "Protect the route with admin auth.",
        "Connect management forms and validations.",
      ]}
      title="Manage categories"
    />
  );
}
