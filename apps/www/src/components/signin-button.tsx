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
        if (env.NEXT_PUBLIC_SUPABASE_URL === "http://localhost:54321") {
          await supabase.auth.signInWithOtp({
            email: env.NEXT_PUBLIC_SUPERADMIN_EMAIL,
          });
        } else {
          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${origin}/api/auth/callback`,
            },
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
