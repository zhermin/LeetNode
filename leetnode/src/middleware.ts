export { default } from "next-auth/middleware";

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
    '/((?!api|_next|favicon.ico|logo|bkt).*)',
  ],
};
