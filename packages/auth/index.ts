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
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
});

export type { Session } from "next-auth/types";
