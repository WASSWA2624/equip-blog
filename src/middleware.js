import { NextResponse } from "next/server";

import {
  ADMIN_REQUEST_PATH_HEADER,
  ADMIN_ROUTE_KIND_HEADER,
  SESSION_COOKIE_NAME,
  buildAdminLoginHref,
  isAdminLoginPath,
  isProtectedAdminApiPath,
  isProtectedAdminPagePath,
} from "@/lib/auth/config";

function createForwardResponse(request, routeKind) {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set(ADMIN_REQUEST_PATH_HEADER, `${request.nextUrl.pathname}${request.nextUrl.search}`);
  requestHeaders.set(ADMIN_ROUTE_KIND_HEADER, routeKind);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const requestPath = `${pathname}${search}`;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (isAdminLoginPath(pathname)) {
    return createForwardResponse(request, "login");
  }

  if (isProtectedAdminPagePath(pathname)) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL(buildAdminLoginHref(requestPath), request.url));
    }

    return createForwardResponse(request, "protected");
  }

  if (isProtectedAdminApiPath(pathname) && !sessionToken) {
    return NextResponse.json(
      {
        message: "Admin authentication is required.",
        status: "auth_required",
        success: false,
      },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
