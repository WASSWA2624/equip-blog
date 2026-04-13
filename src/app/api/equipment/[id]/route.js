import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createEquipmentManagementErrorPayload,
  updateManagedEquipmentLifecycle,
} from "@/features/equipment-management";
import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";
import { validateJsonRequest } from "@/lib/validation/api-placeholders";

const updateEquipmentSchema = z
  .object({
    lifecycleNotes: z.string().trim().optional(),
    lifecycleStatus: z.string().trim().min(1),
  })
  .strict();

export async function PATCH(request, { params }) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.EDIT_POSTS);

  if (auth.response) {
    return auth.response;
  }

  const result = await validateJsonRequest(request, updateEquipmentSchema);

  if (result.response) {
    return result.response;
  }

  try {
    const { id } = await params;
    const data = await updateManagedEquipmentLifecycle(
      {
        equipmentId: id,
        ...result.data,
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
