export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/api/((?!email/sendEmailActual)(?!email/checkUserError).*)",
    "/courses/:path*",
  ],
};
