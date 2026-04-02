import { requireAdminApiSession } from "@/lib/auth/api";
import { scaffoldRouteResponse } from "@/lib/validation/api-placeholders";

export async function GET(request) {
  const auth = await requireAdminApiSession(request);

  if (auth.response) {
    return auth.response;
  }

  return scaffoldRouteResponse({
    access: "admin",
    method: "GET",
    route: "/api/models",
  });
}
