import { z } from "zod";

import { requireAdminApiSession } from "@/lib/auth/api";
import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const revalidateSchema = z.object({
  path: z.string().optional(),
  secret: z.string().optional(),
});

export async function POST(request) {
  const auth = await requireAdminApiSession(request);

  if (auth.response) {
    return auth.response;
  }

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
