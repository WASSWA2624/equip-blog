import { NextResponse } from "next/server";

import {
  createEquipmentManagementErrorPayload,
  createManualEquipmentDraft,
} from "@/features/equipment-management";
import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";

export async function POST(request, { params }) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.EDIT_POSTS);

  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = await createManualEquipmentDraft(
      {
        equipmentId: id,
      },
      {
        actorId: auth.user.id,
      },
    );

    return NextResponse.json({
      data,
      success: true,
    });
  } catch (error) {
    const payload = createEquipmentManagementErrorPayload(error);

    return NextResponse.json(payload.body, { status: payload.statusCode });
  }
}
