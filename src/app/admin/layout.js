import AdminShell from "@/components/layout/admin-shell";
import { defaultLocale } from "@/features/i18n/config";
import { getMessages } from "@/features/i18n/get-messages";
import { LocaleMessagesProvider } from "@/features/i18n/locale-provider";

export async function generateMetadata() {
  return {
    title: "Equip Blog Admin",
    description: "Admin workspace scaffold for Equip Blog.",
  };
}

export default async function AdminLayout({ children }) {
  const messages = await getMessages(defaultLocale);

  return (
    <LocaleMessagesProvider locale={defaultLocale} messages={messages}>
      <AdminShell messages={messages}>{children}</AdminShell>
    </LocaleMessagesProvider>
  );
}
