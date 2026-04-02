import { z } from "zod";

import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const mediaUploadSchema = z.object({
  alt: z.string().optional(),
  fileName: z.string().optional(),
});

export async function POST(request) {
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
