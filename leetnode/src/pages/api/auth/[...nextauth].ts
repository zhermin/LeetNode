import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

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
      // Return false for default error message or return redirect URL, eg. return '/unauthorized'
      if (!request.user.email) {
        return false;
      }

      // Check if allowed to sign in based on whitelist
      const allowedUsers = await prisma.user.findMany({
        select: {
          email: true,
        },
      });
      const isAllowedToSignIn = allowedUsers.some(
        (allowedEmail) => allowedEmail.email === request.user.email
      );
      if (!isAllowedToSignIn) {
        return false;
      }

      // Initialize image for first login
      if (!request.user.image) {
        await prisma.user.update({
          where: {
            email: request.user.email,
          },
          data: {
            image: `https://api.dicebear.com/6.x/fun-emoji/png?seed=${request.user.username}`,
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
