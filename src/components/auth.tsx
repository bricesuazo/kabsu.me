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
        <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Icons.google className="h-4 w-4 mr-2" />
      )}
      Sign in with Google
    </Button>
  );
}
