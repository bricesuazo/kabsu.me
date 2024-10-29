import { redirect } from "next/navigation";

import { createClient } from "@kabsu.me/supabase/client/server";

import Reactivate from "./_components/reactivate";

export default async function ReactivatePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!data?.deactivated_at) redirect("/");

  return (
    <div className="space-y-4">
      <div className="grid h-40 place-items-center bg-primary">
        <h2 className="text-2xl font-semibold">Reactivate</h2>
      </div>

      <div>
        <p className="text-balance text-center">
          Your account has been deactivated.
        </p>
        <p className="text-balance text-center">
          To reactivate your account, click the button below.
        </p>
      </div>

      <Reactivate />
    </div>
  );
}
