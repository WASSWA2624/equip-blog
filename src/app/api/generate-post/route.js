import { NextResponse } from "next/server";

import { createAiCompositionErrorPayload, generateDraftFromRequest } from "@/lib/ai";
import { requireAdminApiPermission } from "@/lib/auth/api";
import { ADMIN_PERMISSIONS } from "@/lib/auth/rbac";
import { generationRequestSchema } from "@/lib/validation";
import { validateJsonRequest } from "@/lib/validation/api-placeholders";

export async function POST(request) {
  const auth = await requireAdminApiPermission(request, ADMIN_PERMISSIONS.GENERATE_POSTS);

  if (auth.response) {
    return auth.response;
  }

  const result = await validateJsonRequest(request, generationRequestSchema);

  if (result.response) {
    return result.response;
  }

  try {
    const generationResult = await generateDraftFromRequest(result.data, {
      actorId: auth.user.id,
    });

    return NextResponse.json(generationResult);
  } catch (error) {
    const payload = createAiCompositionErrorPayload(error);

    return NextResponse.json(payload.body, { status: payload.statusCode });
  }
}
