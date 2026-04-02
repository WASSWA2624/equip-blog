import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";
import { generationRequestSchema } from "@/lib/validation";
import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

export async function POST(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.GENERATE_POSTS);

  if (auth.response) {
    return auth.response;
  }

  const result = await validateJsonRequest(request, generationRequestSchema);

  if (result.response) {
    return result.response;
  }

  return scaffoldRouteResponse({
    access: "admin",
    body: result.data,
    method: "POST",
    route: "/api/generate-post",
  });
}
