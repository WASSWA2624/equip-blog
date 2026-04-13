import { NextResponse } from "next/server";

import { getEquipmentManagementSnapshot } from "@/features/equipment-management";
import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";

export async function GET(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.VIEW_CONTENT_LISTS);

  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);

  const data = await getEquipmentManagementSnapshot({
    lifecycleStatus: searchParams.get("status") || "all",
    page: searchParams.get("page") || 1,
    search: searchParams.get("q") || "",
  });

  return NextResponse.json({
    data,
    success: true,
  });
}
