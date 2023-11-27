"use server";

import type { OAuthProviders } from "@cvsu.me/auth";
import {
  signIn as signInAuth,
  signOut as signOutAuth,
  update as updateAuth,
} from "@cvsu.me/auth";

export async function signIn(
  provider?: OAuthProviders,
  options?: {
    redirectTo?: string | undefined;
    redirect?: true | undefined;
  },
) {
  return await signInAuth(provider, options);
}

export async function signOut(
  options?:
    | {
        redirectTo?: string | undefined;
        redirect?: true | undefined;
      }
    | undefined,
) {
  return await signOutAuth(options);
}

export async function update(data: unknown) {
  return await updateAuth(data as Record<string, unknown>);
}
