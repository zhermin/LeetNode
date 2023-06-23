import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

import { env } from "@/env/server.mjs";
import { prisma } from "@/server/db/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  callbacks: {
    // Include id and role in session and jwt tokens
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
      // Callback runs before and after email sign in (verification and after magic link)
      if (!request.user.email) {
        return false;
      }

      // Check if allowed to sign in based on whitelist
      const allowedUsers = await prisma.user.findMany({
        select: {
          email: true,
          isNewUser: true,
        },
      });
      const isAllowedToSignIn = allowedUsers.some(
        (allowedEmail) => allowedEmail.email === request.user.email
      );
      if (!isAllowedToSignIn) {
        return false;
      }

      // Initialize other info only for non-email sign in methods
      const user = allowedUsers.find(
        (user) => user.email === request.user.email
      );
      if (request.account?.provider !== "email" && user?.isNewUser) {
        const username =
          request.user.username ??
          request.user.email.split("@")[0] ??
          request.user.email;
        await prisma.user.update({
          where: {
            email: request.user.email,
          },
          data: {
            username,
            image:
              request.user.image ??
              `https://api.dicebear.com/6.x/fun-emoji/png?seed=${username}`,
            isNewUser: false,
          },
        });
      }

      // Successful login
      return true;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
      maxAge: 24 * 60 * 60 * 30, // 30d (Email magic links' valid duration, default 24h)
    }),
  ],
  pages: {
    // Custom redirect all auth to homepage and send notifications instead
    signIn: "/",
    error: "/",
    verifyRequest: "/",
    // New user redirect doesn't work for email provider as we add whitelisted emails into the User table, causing the new users to not be counted as new users
    newUser: "/welcome",
  },
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
