import { UserCog2 } from "lucide-react";

import { api } from "~/lib/trpc/server";
import TypePrograms from "./_components/type-programs";

export default async function AccountSettingsPage() {
  const currentUserTypeProgram =
    await api.users.getCurrentUserTypeProgram.query();

  return (
    <div className="p-4">
      <div className="flex h-20 flex-col items-center justify-center gap-2">
        <UserCog2 size="2rem" />
        <h2 className="text-center text-xl font-semibold">Account Settings</h2>
      </div>
      <TypePrograms currentUserTypeProgram={currentUserTypeProgram} />
    </div>
  );
}
