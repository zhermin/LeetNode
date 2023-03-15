export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/api/((?!email/sendEmail || ?!pybkt/cronUpdate).*)", "/courses/:path*"],
};
