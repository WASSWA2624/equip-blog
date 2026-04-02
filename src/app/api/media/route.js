import { z } from "zod";

import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";
import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const mediaUploadSchema = z.object({
  alt: z.string().optional(),
  fileName: z.string().optional(),
});

export async function POST(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.UPLOAD_MEDIA);

  if (auth.response) {
    return auth.response;
  }

  const result = await validateJsonRequest(request, mediaUploadSchema);

  if (result.response) {
    return result.response;
  }

  return scaffoldRouteResponse({
    access: "admin",
    body: result.data,
    method: "POST",
    route: "/api/media",
  });
}
