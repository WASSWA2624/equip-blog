import { NextResponse } from "next/server";

import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";
import {
  createResearchDataErrorPayload,
  getSourceConfigurationSnapshot,
  saveSourceConfigurations,
  saveSourceConfigurationsSchema,
} from "@/lib/research";
import { validateJsonRequest } from "@/lib/validation/api-placeholders";

export async function GET(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.MANAGE_SOURCE_CONFIG);

  if (auth.response) {
    return auth.response;
  }

  try {
    const snapshot = await getSourceConfigurationSnapshot();

    return NextResponse.json({
      data: snapshot,
      success: true,
    });
  } catch (error) {
    const payload = createResearchDataErrorPayload(error);

    return NextResponse.json(payload.body, { status: payload.statusCode });
  }
}

export async function PUT(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.MANAGE_SOURCE_CONFIG);

  if (auth.response) {
    return auth.response;
  }

  const result = await validateJsonRequest(request, saveSourceConfigurationsSchema);

  if (result.response) {
    return result.response;
  }

  try {
    const savedConfigurations = await saveSourceConfigurations(result.data, {
      actorId: auth.user.id,
    });

    return NextResponse.json({
      data: savedConfigurations,
      success: true,
    });
  } catch (error) {
    const payload = createResearchDataErrorPayload(error);

    return NextResponse.json(payload.body, { status: payload.statusCode });
  }
}
