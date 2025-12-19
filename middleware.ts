import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that require authentication
const protectedPaths = [
  "/analytics",
  "/campaigns",
  "/companies",
  "/content",
  "/dashboard",
  "/dispatches",
  "/email-lists",
  "/email-sending",
  "/emails",
  "/inbox",
  "/neuron",
  "/profile",
  "/research",
  "/sent-emails",
  "/settings",
  "/templates",
  "/test-searchparams",
  "/workflows",
]

// Paths that should redirect to dashboard if already authenticated
const authPaths = ["/auth/login", "/auth/register", "/auth/password-reset"]

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const path = request.nextUrl.pathname

  // Check if path requires authentication
  if (protectedPaths.some((p) => path.startsWith(p))) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", path)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (authPaths.some((p) => path.startsWith(p)) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
