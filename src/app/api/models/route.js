import { scaffoldRouteResponse } from "@/lib/validation/api-placeholders";

export async function GET() {
  return scaffoldRouteResponse({
    access: "admin",
    method: "GET",
    route: "/api/models",
  });
}
