import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";
import { scaffoldRouteResponse } from "@/lib/validation/api-placeholders";

export async function GET(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.VIEW_CONTENT_LISTS);

  if (auth.response) {
    return auth.response;
  }

  return scaffoldRouteResponse({
    access: "admin",
    method: "GET",
    route: "/api/posts",
  });
}
