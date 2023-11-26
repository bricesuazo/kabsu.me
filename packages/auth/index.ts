import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

import { db } from "@cvsu.me/db";
import type { ACCOUNT_TYPE } from "@cvsu.me/db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      username: string | null;
      program_id: string | null;
      type: (typeof ACCOUNT_TYPE)[number] | null;
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    // ...other properties
    // role: UserRole;
    username?: string | null;
    program_id?: string | null;
    type?: (typeof ACCOUNT_TYPE)[number] | null;
  }
}

export const providers = ["google"] as const;
export type OAuthProviders = (typeof providers)[number];

export const {
  handlers: { GET, POST },
  auth,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  signIn,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  signOut,
  update,
} = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [Google],
  callbacks: {
    signIn: ({ profile }) => {
      if (
        profile?.email === "cvsudotme@gmail.com" ||
        profile?.email?.endsWith("@cvsu.edu.ph")
      )
        return true;

      return false;
    },
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          program_id: user.program_id,
          type: user.type,
          email: user.email,
        },
      };
    },
    // jwt: ({
    //   token,
    //   user,
    //   // trigger, session
    // }) => {
    //   if (user) {
    //     token.id = user.id;
    //     token.email = user.email;
    //     token.username = user.username;
    //     token.image = user.image;
    //     token.program_id = user.program_id;
    //     token.type = user.type;
    //   }
    //   // if (trigger === "update" && session) {
    //   //   console.log("🚀 ~ file: auth.ts:80 ~ session:", session);
    //   //   return token;
    //   // }
    //   return token;
    // },
  },
  pages: {
    signIn: "/",
    newUser: "/",
    signOut: "/",
    error: "/",
  },
});

export type { Session } from "next-auth/types";
