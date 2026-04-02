import PlaceholderPage from "@/components/common/placeholder-page";

export default function AdminLoginPage() {
  return (
    <PlaceholderPage
      badges={["/admin/login", "Auth entry"]}
      description="The admin login screen is in place for the email/password authentication flow defined in the architecture."
      eyebrow="Login"
      notes={[
        "Add secure credential validation.",
        "Persist admin sessions.",
        "Separate login from protected admin surfaces.",
      ]}
      title="Admin login"
    />
  );
}
