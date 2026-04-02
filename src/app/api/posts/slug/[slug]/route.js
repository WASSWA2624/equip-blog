import {
  scaffoldRouteResponse,
  slugParamSchema,
  validateParams,
} from "@/lib/validation/api-placeholders";

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const validatedParams = validateParams(resolvedParams, slugParamSchema);

  if (validatedParams.response) {
    return validatedParams.response;
  }

  return scaffoldRouteResponse({
    access: "public",
    method: "GET",
    params: validatedParams.data,
    route: "/api/posts/slug/:slug",
  });
}
