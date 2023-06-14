import { DefaultSession } from "next-auth";

import { Role } from "@prisma/client";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string;
    role: Role;
  }
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      username: string;
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  /** Passed as a parameter to the `jwt` callback */
  interface User {
    username: string;
    id: string;
    role: Role;
  }
}
