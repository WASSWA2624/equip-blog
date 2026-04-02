import { z } from "zod";

import { ensureAdminApiPermission, requireAdminApiSession } from "@/lib/auth/api";
import { getRequiredPermissionsForPostUpdate } from "@/lib/auth/rbac";
import {
  idParamSchema,
  scaffoldRouteResponse,
  validateJsonRequest,
  validateParams,
} from "@/lib/validation/api-placeholders";

const updatePostSchema = z.object({
  editorialStage: z.string().optional(),
  status: z.string().optional(),
  title: z.string().optional(),
});

export async function PATCH(request, { params }) {
  const auth = await requireAdminApiSession(request);

  if (auth.response) {
    return auth.response;
  }

  const resolvedParams = await params;
  const validatedParams = validateParams(resolvedParams, idParamSchema);

  if (validatedParams.response) {
    return validatedParams.response;
  }

  const validatedBody = await validateJsonRequest(request, updatePostSchema);

  if (validatedBody.response) {
    return validatedBody.response;
  }

  for (const permission of getRequiredPermissionsForPostUpdate(validatedBody.data)) {
    const authorizationResponse = ensureAdminApiPermission(auth.user, permission);

    if (authorizationResponse) {
      return authorizationResponse;
    }
  }

  return scaffoldRouteResponse({
    access: "admin",
    body: validatedBody.data,
    method: "PATCH",
    params: validatedParams.data,
    route: "/api/posts/:id",
  });
}
