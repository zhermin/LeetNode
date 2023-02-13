export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/api/((?!email/sendEmail).*)", "/courses/:path*"],
};
