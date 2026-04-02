import { z } from "zod";

import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";
import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const generatePostSchema = z.object({
  articleDepth: z.string().optional(),
  equipmentName: z.string().min(1).optional(),
  locale: z.string().optional(),
  providerConfigId: z.string().optional(),
  targetAudience: z.array(z.string()).optional(),
});

export async function POST(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.GENERATE_POSTS);

  if (auth.response) {
    return auth.response;
  }

  const result = await validateJsonRequest(request, generatePostSchema);

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
