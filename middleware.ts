import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/vendors",
];

export function middleware(
  request: NextRequest
) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const isPublic =
    publicRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`)
    );

  if (isPublic) {
    return NextResponse.next();
  }

  const userId =
    request.cookies.get("rk_user_id")?.value;

  const role =
    request.cookies.get("rk_user_role")?.value;

  if (!userId || !role) {
    const loginUrl =
      new URL("/login", request.url);

    loginUrl.searchParams.set(
      "next",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  if (
    pathname.startsWith("/admin") &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  if (
    pathname.startsWith("/vendor-dashboard") &&
    role !== "VENDOR"
  ) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  if (
    (
      pathname.startsWith("/customer") ||
      pathname.startsWith("/customer-dashboard")
    ) &&
    role !== "CUSTOMER"
  ) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
