import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

import { Role } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    // Redirect if they don't have the allowed role
    if (
      req.nextUrl.pathname.includes("admin") &&
      req.nextauth.token?.role !== Role.SUPERUSER &&
      req.nextauth.token?.role !== Role.ADMIN
    ) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  },
  {
    pages: {
      // Custom redirect all auth to homepage and send notifications instead
      signIn: "/",
      error: "/",
      verifyRequest: "/",
    },
  }
);

export const config = {
  matcher: [
    "/api/:path((?!email/sendEmail|pybkt/cronUpdate).*)",
    /*
     * Match all request paths EXCEPT for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo / bkt (Render images at index)
     */
    "/((?!api|_next|favicon.ico|logo|bkt).*)",
  ],
};
