import { NextResponse } from "next/server";

import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";
import { validateJsonRequest } from "@/lib/validation/api-placeholders";
import {
  createProviderConfigurationErrorPayload,
  getProviderConfigurationSnapshot,
  saveProviderConfigurations,
  saveProviderConfigurationsSchema,
} from "@/lib/ai/provider-configs";

export async function GET(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.MANAGE_PROVIDER_CONFIG);

  if (auth.response) {
    return auth.response;
  }

  try {
    const snapshot = await getProviderConfigurationSnapshot();

    return NextResponse.json({
      data: snapshot,
      success: true,
    });
  } catch (error) {
    const payload = createProviderConfigurationErrorPayload(error);

    return NextResponse.json(payload.body, { status: payload.statusCode });
  }
}

export async function PUT(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.MANAGE_PROVIDER_CONFIG);

  if (auth.response) {
    return auth.response;
  }

  const result = await validateJsonRequest(request, saveProviderConfigurationsSchema);

  if (result.response) {
    return result.response;
  }

  try {
    const savedProviderConfigurations = await saveProviderConfigurations(result.data, {
      actorId: auth.user.id,
    });

    return NextResponse.json({
      data: savedProviderConfigurations,
      success: true,
    });
  } catch (error) {
    const payload = createProviderConfigurationErrorPayload(error);

    return NextResponse.json(payload.body, { status: payload.statusCode });
  }
}
