import { z } from "zod";

import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const saveDraftSchema = z.object({
  locale: z.string().optional(),
  postId: z.string().optional(),
  title: z.string().optional(),
});

export async function POST(request) {
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
