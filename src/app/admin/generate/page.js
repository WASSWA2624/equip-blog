import GeneratePostScreen from "@/components/admin/generate-post-screen";
import { getAdminGeneratePostSnapshotWithOptions } from "@/features/generator/admin-screen";
import { defaultLocale } from "@/features/i18n/config";
import { getMessages } from "@/features/i18n/get-messages";
import { requireAdminPageSession } from "@/lib/auth";

function normalizeEquipmentSeed(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 191);
}

export default async function GeneratePage({ searchParams }) {
  const auth = await requireAdminPageSession("/admin/generate");
  const resolvedSearchParams = await searchParams;
  const equipmentName = normalizeEquipmentSeed(resolvedSearchParams?.equipment);
  const [messages, snapshot] = await Promise.all([
    getMessages(defaultLocale),
    getAdminGeneratePostSnapshotWithOptions(auth.user, undefined, {
      defaults: {
        equipmentName,
      },
    }),
  ]);

  return <GeneratePostScreen copy={messages.admin.generatePost} initialData={snapshot} />;
}
