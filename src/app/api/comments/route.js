import { z } from "zod";

import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const createCommentSchema = z.object({
  body: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  postSlug: z.string().optional(),
});

export async function POST(request) {
  const result = await validateJsonRequest(request, createCommentSchema);

  if (result.response) {
    return result.response;
  }

  return scaffoldRouteResponse({
    access: "public",
    body: result.data,
    method: "POST",
    route: "/api/comments",
  });
}
