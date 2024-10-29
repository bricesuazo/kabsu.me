"use client";

import { useState } from "react";

import { createClient } from "@kabsu.me/supabase/client/client";
import { Button } from "@kabsu.me/ui/button";

import { env } from "~/env";
import { Icons } from "./icons";

export default function SigninButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  return (
    <div className="flex items-center gap-2">
      {env.NEXT_PUBLIC_SUPABASE_URL === "http://localhost:54321" && (
        <Button
          className="rounded-full"
          variant="outline"
          onClick={() =>
            supabase.auth.signInWithOtp({
              email: env.NEXT_PUBLIC_SUPERADMIN_EMAIL,
              options: {
                emailRedirectTo: `${origin}/api/auth/callback`,
              },
            })
          }
        >
          Sign in with InBucket
        </Button>
      )}
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
    </div>
  );
}
