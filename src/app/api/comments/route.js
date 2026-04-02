import { commentSubmissionSchema } from "@/lib/validation";
import { scaffoldRouteResponse, validateJsonRequest } from "@/lib/validation/api-placeholders";

export async function POST(request) {
  const result = await validateJsonRequest(request, commentSubmissionSchema);

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
