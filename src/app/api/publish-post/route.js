import { z } from "zod";

import { ensureAdminApiPermission, requireAdminApiSession } from "@/lib/auth/api";
import { getRequiredPermissionForPublishAction } from "@/lib/auth/rbac";
import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const publishPostSchema = z.object({
  postId: z.string().optional(),
  publishAt: z.string().nullable().optional(),
});

export async function POST(request) {
  const auth = await requireAdminApiSession(request);

  if (auth.response) {
    return auth.response;
  }

  const result = await validateJsonRequest(request, publishPostSchema);

  if (result.response) {
    return result.response;
  }

  const authorizationResponse = ensureAdminApiPermission(
    auth.user,
    getRequiredPermissionForPublishAction(result.data.publishAt),
  );

  if (authorizationResponse) {
    return authorizationResponse;
  }

  return scaffoldRouteResponse({
    access: "admin",
    body: result.data,
    method: "POST",
    route: "/api/publish-post",
  });
}
