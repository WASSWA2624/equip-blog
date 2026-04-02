import { z } from "zod";

import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const revalidateSchema = z.object({
  path: z.string().optional(),
  secret: z.string().optional(),
});

export async function POST(request) {
  const result = await validateJsonRequest(request, revalidateSchema);

  if (result.response) {
    return result.response;
  }

  return scaffoldRouteResponse({
    access: "admin",
    body: result.data,
    method: "POST",
    route: "/api/revalidate",
  });
}
