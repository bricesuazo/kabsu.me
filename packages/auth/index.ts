import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

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
    username: string | null;
    program_id: string | null;
    type: (typeof ACCOUNT_TYPE)[number] | null;
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
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    signIn: (props) => {
      console.log("🚀 ~ file: index.ts:49 ~ signIn props:", props);
      if (
        props.profile?.email === "cvsudotme@gmail.com" ||
        props.profile?.email?.endsWith("@cvsu.edu.ph")
      ) {
        return true;
      }

      props.user.email = "asdasd";
      return false;
    },
    jwt: (props) => {
      console.log("jwt🚀 ~ file: index.ts:58 ~ jwt props:", props);

      return props.token;
    },

    session: (props) => {
      console.log("🚀 ~ file: index.ts:59 ~ session props:", props);

      return props.session;
    },
  },
  pages: {
    signIn: "/",
    newUser: "/",
    signOut: "/",
    error: "/",
  },
});

export type { Session } from "next-auth/types";
