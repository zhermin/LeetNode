export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/api/:path((?!email/sendEmail|pybkt/cronUpdate).*)",
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next / image|favicon.ico).*)'
  ],
};
