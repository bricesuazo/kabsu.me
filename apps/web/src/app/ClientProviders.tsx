"use client";

import type { PropsWithChildren } from "react";
import { api } from "@/api/client";

export default function ClientProviders({ children }: PropsWithChildren) {
  return <api.Provider>{children}</api.Provider>;
}
