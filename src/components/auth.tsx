"use client";

import { Button } from "@/components/ui/button";
import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { Icons } from "./icons";

export default function Auth() {
  const [isLoading, setLoading] = useState(false);
  const { isLoaded, signIn } = useSignIn();
  return (
    <Button
      variant="outline"
      onClick={() => {
        if (!isLoaded) return;

        setLoading(true);

        signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        });
      }}
      disabled={!isLoaded || isLoading}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.google className="mr-2 h-4 w-4" />
      )}
      Sign in with CvSU Account
    </Button>
  );
}
