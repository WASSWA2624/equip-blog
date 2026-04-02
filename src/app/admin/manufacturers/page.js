import PlaceholderPage from "@/components/common/placeholder-page";

export default function ManufacturersPage() {
  return (
    <PlaceholderPage
      badges={["/admin/manufacturers", "Management"]}
      description="The manufacturers management route is scaffolded for maintaining canonical manufacturer data."
      eyebrow="Manufacturers"
      notes={[
        "Manage manufacturer entries and model relationships.",
        "Feed lookup APIs used during generation.",
        "Keep admin access protected.",
      ]}
      title="Manage manufacturers"
    />
  );
}
