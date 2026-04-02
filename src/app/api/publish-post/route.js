import { z } from "zod";

import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const publishPostSchema = z.object({
  postId: z.string().optional(),
  publishAt: z.string().nullable().optional(),
});

export async function POST(request) {
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
