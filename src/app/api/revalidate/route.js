import { z } from "zod";

import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";
import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const revalidateSchema = z.object({
  path: z.string().optional(),
  secret: z.string().optional(),
});

export async function POST(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.REVALIDATE_SITE);

  if (auth.response) {
    return auth.response;
  }

  const result = await validateJsonRequest(request, revalidateSchema);

  if (result.response) {
    return result.response;
  }

  return scaffoldRouteResponse({
    access: "admin",
    body: result.data,
    method: "POST",
    route: "/api/revalidate",
  });
}
