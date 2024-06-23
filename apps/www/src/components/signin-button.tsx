"use client";

import { useState } from "react";

import { env } from "~/env";
import { createClient } from "~/supabase/client";
import { Icons } from "./icons";
import { Button } from "./ui/button";

export default function SigninButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  return (
    <Button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        if (env.NODE_ENV === "development") {
          await supabase.auth.signInWithOtp({
            email: "bricebrine.suazo@cvsu.edu.ph",
          });
        } else {
          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: "/" },
          });
        }
        setLoading(false);
      }}
    >
      {!loading ? (
        <Icons.google className="mr-2 h-4 w-4" />
      ) : (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      )}
      Sign in with CvSU Account
    </Button>
  );
}
