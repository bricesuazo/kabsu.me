"use client";

import type { PropsWithChildren } from "react";
import { ClerkProvider } from "@clerk/nextjs/app-beta/client";

import { api } from "~/api/client";
import { env } from "~/env.mjs";

export default function ClientProviders({ children }: PropsWithChildren) {
  return (
    <ClerkProvider publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <api.Provider>{children}</api.Provider>
    </ClerkProvider>
  );
}
