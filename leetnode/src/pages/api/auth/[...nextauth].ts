import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    async session({ session, token, user }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = user?.role ? user.role : token.role;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async signIn(request) {
      const allowedEmails = await prisma.user.findMany({
        select: {
          email: true,
        },
      });
      if (!request.user.email) {
        return false;
      }

      const isAllowedToSignIn = allowedEmails.some(
        (allowedEmail) => allowedEmail.email === request.user.email
      );
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false for default error message or return redirect URL, eg. return '/unauthorized'
        return false;
      }
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
      maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
    }),
  ],
  pages: {
    newUser: "/welcome",
  },
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
