import { z } from "zod";

import { requireAdminApiSession } from "@/lib/auth/api";
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

  return scaffoldRouteResponse({
    access: "admin",
    body: result.data,
    method: "POST",
    route: "/api/publish-post",
  });
}
