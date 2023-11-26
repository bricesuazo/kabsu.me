import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

import { db } from "@cvsu.me/db";
import { users } from "@cvsu.me/db/schema";
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
    signIn: async ({ profile, user }) => {
      if (
        profile?.email === "cvsudotme@gmail.com" ||
        profile?.email?.endsWith("@cvsu.edu.ph")
      ) {
        const isUserExist = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, profile?.email ?? ""),
        });

        if (!isUserExist) {
          await db.insert(users).values({
            email: profile?.email,
            name: profile?.name ?? "",
            image: (profile?.picture as string | null) ?? null,
          });
        } else {
          user.username = isUserExist.username;
          user.id = isUserExist.id;
          user.image =
            typeof isUserExist.image === "string"
              ? isUserExist.image
              : isUserExist.image
                ? isUserExist.image.url
                : null;
          user.program_id = isUserExist.program_id;
          user.type = isUserExist.type;
          user.name = isUserExist.name;
        }

        return true;
      }
      return false;
    },
    jwt: ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.program_id = user.program_id;
        token.type = user.type;
        token.name = user.name;
        token.image = user.image;
      }

      if (trigger === "update" && session) {
        console.log("🚀 ~ file: auth.ts:80 ~ session:", session);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return { ...token, ...session.user };
      }

      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          username: token.username,
          program_id: token.program_id,
          image: token.image as string | null,
          type: token.type,
          name: token.name,
          email: token.email,
        },
      };
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
