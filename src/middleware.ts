import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

  // Allow public routes (auth endpoints, login page, debug)
  if (
        pathname === "/login" ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/debug")
      ) {
        return NextResponse.next();
  }

  // Check for session token cookie (NextAuth v5 JWT strategy)
  const token =
        request.cookies.get("authjs.session-token") ||
        request.cookies.get("__Secure-authjs.session-token") ||
        request.cookies.get("next-auth.session-token") ||
        request.cookies.get("__Secure-next-auth.session-token");

  if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
    matcher: [
          "/((?!_next/static|_next/image|favicon.ico|manifest.json|service-worker.js).*)",
        ],
};
