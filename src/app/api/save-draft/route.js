import { z } from "zod";

import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";
import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const saveDraftSchema = z.object({
  locale: z.string().optional(),
  postId: z.string().optional(),
  title: z.string().optional(),
});

export async function POST(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.EDIT_POSTS);

  if (auth.response) {
    return auth.response;
  }

  const result = await validateJsonRequest(request, saveDraftSchema);

  if (result.response) {
    return result.response;
  }

  return scaffoldRouteResponse({
    access: "admin",
    body: result.data,
    method: "POST",
    route: "/api/save-draft",
  });
}
