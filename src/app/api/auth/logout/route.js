import { scaffoldRouteResponse } from "@/lib/validation/api-placeholders";

export async function POST() {
  return scaffoldRouteResponse({
    access: "admin",
    method: "POST",
    route: "/api/auth/logout",
  });
}
