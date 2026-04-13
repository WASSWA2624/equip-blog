import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/config";
import { getAdminAuthorizationFailure, hasAdminPermission } from "@/lib/auth/rbac";
import { env } from "@/lib/env/server";

import {
  authenticateAdminCredentials,
  buildLoginSuccessPayload,
  buildLogoutSuccessPayload,
  invalidateAdminSession,
  validateRequestAdminSession,
} from "./index";

const AUTH_UNAVAILABLE_MESSAGE =
  "Admin authentication is temporarily unavailable. Apply the latest database migrations and try again.";

function getSessionCookieSettings(expiresAt) {
  return {
    expires: expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: env.app.url.startsWith("https://"),
  };
}

export function setAdminSessionCookie(response, sessionToken, expiresAt) {
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieSettings(expiresAt));
}

export function clearAdminSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieSettings(new Date(0)),
    maxAge: 0,
  });
}

export async function requireAdminApiSession(request) {
  const validation = await validateRequestAdminSession(request);

  if (validation.status !== "authenticated") {
    const isAuthUnavailable = validation.status === "auth_unavailable";
    const response = NextResponse.json(
      {
        message: isAuthUnavailable ? AUTH_UNAVAILABLE_MESSAGE : "Admin authentication is required.",
        status: validation.status,
        success: false,
      },
      { status: isAuthUnavailable ? 503 : 401 },
    );

    if (validation.status !== "auth_required" && validation.status !== "auth_unavailable") {
      clearAdminSessionCookie(response);
    }

    return {
      response,
    };
  }

  return validation;
}

export function createAdminAuthorizationFailureResponse(permission, user) {
  return NextResponse.json(getAdminAuthorizationFailure(permission, user), { status: 403 });
}

export function ensureAdminApiPermission(user, permission) {
  if (hasAdminPermission(user, permission)) {
    return null;
  }

  return createAdminAuthorizationFailureResponse(permission, user);
}

export async function requireAdminApiPermission(request, permission) {
  const auth = await requireAdminApiSession(request);

  if (auth.response) {
    return auth;
  }

  const authorizationResponse = ensureAdminApiPermission(auth.user, permission);

  if (authorizationResponse) {
    return {
      response: authorizationResponse,
    };
  }

  return auth;
}

export async function createLoginResponse({ email, password, userAgent }) {
  const result = await authenticateAdminCredentials({ email, password, userAgent });

  if (!result.success) {
    const isAuthUnavailable = result.status === "auth_unavailable";
    return NextResponse.json(
      {
        message: isAuthUnavailable
          ? AUTH_UNAVAILABLE_MESSAGE
          : "The email or password is incorrect.",
        status: result.status,
        success: false,
      },
      { status: isAuthUnavailable ? 503 : 401 },
    );
  }

  const response = NextResponse.json(buildLoginSuccessPayload(result.user, result.expiresAt));

  setAdminSessionCookie(response, result.sessionToken, result.expiresAt);

  return response;
}

export async function createLogoutResponse(sessionToken) {
  await invalidateAdminSession(sessionToken);

  const response = NextResponse.json(buildLogoutSuccessPayload());

  clearAdminSessionCookie(response);

  return response;
}
