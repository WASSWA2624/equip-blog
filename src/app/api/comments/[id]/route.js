import { z } from "zod";

import { requireAdminApiSession } from "@/lib/auth/api";
import {
  idParamSchema,
  scaffoldRouteResponse,
  validateJsonRequest,
  validateParams,
} from "@/lib/validation/api-placeholders";

const updateCommentSchema = z.object({
  moderationStatus: z.string().optional(),
});

async function resolveCommentParams(params) {
  const resolvedParams = await params;
  return validateParams(resolvedParams, idParamSchema);
}

export async function PATCH(request, { params }) {
  const auth = await requireAdminApiSession(request);

  if (auth.response) {
    return auth.response;
  }

  const validatedParams = await resolveCommentParams(params);

  if (validatedParams.response) {
    return validatedParams.response;
  }

  const validatedBody = await validateJsonRequest(request, updateCommentSchema);

  if (validatedBody.response) {
    return validatedBody.response;
  }

  return scaffoldRouteResponse({
    access: "admin",
    body: validatedBody.data,
    method: "PATCH",
    params: validatedParams.data,
    route: "/api/comments/:id",
  });
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminApiSession(request);

  if (auth.response) {
    return auth.response;
  }

  const validatedParams = await resolveCommentParams(params);

  if (validatedParams.response) {
    return validatedParams.response;
  }

  return scaffoldRouteResponse({
    access: "admin",
    method: "DELETE",
    params: validatedParams.data,
    route: "/api/comments/:id",
  });
}
