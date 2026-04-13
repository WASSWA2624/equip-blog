import EquipmentManagementScreen from "@/components/admin/equipment-management-screen";
import { getEquipmentManagementSnapshot } from "@/features/equipment-management";
import { defaultLocale } from "@/features/i18n/config";
import { getMessages } from "@/features/i18n/get-messages";
import { requireAdminPageSession } from "@/lib/auth";
import { ADMIN_PERMISSIONS, hasAdminPermission } from "@/lib/auth/rbac";

export default async function EquipmentManagementPage({ searchParams }) {
  const auth = await requireAdminPageSession("/admin/equipment");
  const resolvedSearchParams = await searchParams;
  const [messages, snapshot] = await Promise.all([
    getMessages(defaultLocale),
    getEquipmentManagementSnapshot({
      lifecycleStatus: resolvedSearchParams?.status || "all",
      page: resolvedSearchParams?.page || 1,
      search: resolvedSearchParams?.q || "",
    }),
  ]);

  return (
    <EquipmentManagementScreen
      copy={messages.admin.equipmentManagement}
      initialData={snapshot}
      permissions={{
        canEditDrafts: hasAdminPermission(auth.user, ADMIN_PERMISSIONS.EDIT_POSTS),
        canGeneratePosts: hasAdminPermission(auth.user, ADMIN_PERMISSIONS.GENERATE_POSTS),
      }}
    />
  );
}
