import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login", "/api/auth"];
const STATIC_ASSETS = /\.(jpg|jpeg|png|gif|ico|css|js|svg|webp|woff|woff2)$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets
  if (STATIC_ASSETS.test(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (pathname === "/login" || pathname.startsWith("/api/auth") || pathname.startsWith("/api/debug")) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const session = await auth();

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
