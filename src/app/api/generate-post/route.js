import { z } from "zod";

import { requireAdminApiSession } from "@/lib/auth/api";
import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const generatePostSchema = z.object({
  articleDepth: z.string().optional(),
  equipmentName: z.string().min(1).optional(),
  locale: z.string().optional(),
  providerConfigId: z.string().optional(),
  targetAudience: z.array(z.string()).optional(),
});

export async function POST(request) {
  const auth = await requireAdminApiSession(request);

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
