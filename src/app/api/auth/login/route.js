import { z } from "zod";

import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

const loginSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
});

export async function POST(request) {
  const result = await validateJsonRequest(request, loginSchema);

  if (result.response) {
    return result.response;
  }

  return scaffoldRouteResponse({
    access: "admin",
    body: result.data,
    method: "POST",
    route: "/api/auth/login",
  });
}
