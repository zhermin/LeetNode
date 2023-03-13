export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/api/:path*", "/courses/:path*", "/welcome"],
};
