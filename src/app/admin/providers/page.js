import ProviderConfigurationScreen from "@/components/admin/provider-configuration-screen";
import { defaultLocale } from "@/features/i18n/config";
import { getMessages } from "@/features/i18n/get-messages";
import { getProviderConfigurationSnapshot } from "@/lib/ai/provider-configs";

export default async function ProvidersPage() {
  const [messages, snapshot] = await Promise.all([
    getMessages(defaultLocale),
    getProviderConfigurationSnapshot(),
  ]);

  return (
    <ProviderConfigurationScreen
      copy={messages.admin.providerConfiguration}
      initialData={snapshot}
    />
  );
}
