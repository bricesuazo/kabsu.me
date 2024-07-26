import { UserCog2 } from "lucide-react";

import { api } from "~/lib/trpc/server";
import Deactivate from "./_components/deactivate";
import Strikes from "./_components/strikes";
import TypePrograms from "./_components/type-programs";

export default async function AccountSettingsPage() {
  const [currentUserTypeProgram, getMyStrikes, getMyUsername] =
    await Promise.all([
      api.users.getCurrentUserTypeProgram(),
      api.users.getMyStrikes(),
      api.auth.getMyUsername(),
    ]);

  return (
    <>
      <div className="flex h-40 flex-col items-center justify-center gap-2 bg-primary">
        <UserCog2 size="2rem" />
        <h2 className="text-center text-xl font-semibold">Account Settings</h2>
      </div>

      <div className="space-y-10 p-4">
        <Strikes getMyStrikes={getMyStrikes} />
        <TypePrograms currentUserTypeProgram={currentUserTypeProgram} />
        <Deactivate username={getMyUsername} />
      </div>
    </>
  );
}
