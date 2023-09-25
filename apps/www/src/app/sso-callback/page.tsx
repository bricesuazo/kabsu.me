"use client";

import { useEffect } from "react";
import { Icons } from "@/components/icons";
import { useClerk } from "@clerk/nextjs";
import type { HandleOAuthCallbackParams } from "@clerk/types";

export default function SSOCallback(props: {
  params: HandleOAuthCallbackParams;
}) {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    void handleRedirectCallback(props.params);
  }, [props.params, handleRedirectCallback]);

  return (
    <div className="grid h-full w-full place-items-center p-40">
      <div className="flex items-center gap-x-2">
        <Icons.spinner className="animate-spin" />
        <p className="text-center text-sm text-muted-foreground">
          Redirecting...
        </p>
      </div>
    </div>
  );
}
