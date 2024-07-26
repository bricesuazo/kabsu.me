"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { api } from "~/lib/trpc/client";
import { createClient } from "~/supabase/client";

export default function Reactivate() {
  const supabase = createClient();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const reactivateMutation = api.users.reactivate.useMutation({
    onSuccess: () => router.push("/"),
    onError: (error) => toast.error(error.message),
  });
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        disabled={reactivateMutation.isPending}
        onClick={() => reactivateMutation.mutate()}
      >
        {reactivateMutation.isPending ? (
          <>
            <Loader2 className="mr-1.5 size-4 animate-spin" />
            Reactivating...
          </>
        ) : (
          <>Reactivate</>
        )}
      </Button>
      <Button
        variant="outline"
        onClick={async () => {
          setIsSigningOut(true);
          await supabase.auth.signOut();
          router.push("/");
        }}
        disabled={isSigningOut}
      >
        {isSigningOut ? (
          <>
            <Loader2 className="mr-1.5 size-4 animate-spin" />
            Signing out...
          </>
        ) : (
          <>Sign out</>
        )}
      </Button>
    </div>
  );
}
