"use client";

import { useState } from "react";

import { Button } from "@kabsu.me/ui/button";

import { createClient } from "~/supabase/client";
import { Icons } from "./icons";

export default function SigninButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  return (
    <Button
      disabled={loading}
      className="rounded-full"
      onClick={async () => {
        setLoading(true);

        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${origin}/api/auth/callback`,
          },
        });
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
