import { z } from "zod";

import { requireAdminApiSession } from "@/lib/auth/api";
import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const mediaUploadSchema = z.object({
  alt: z.string().optional(),
  fileName: z.string().optional(),
});

export async function POST(request) {
  const auth = await requireAdminApiSession(request);

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
