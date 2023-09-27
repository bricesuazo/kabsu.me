import { api } from "@/lib/trpc/server";

import ProgramsPageWrapper from "./_page";

export default async function ProgramsPage() {
  const campuses = await api.admin.getAllPrograms.query();
  return <ProgramsPageWrapper campuses={campuses} />;
}
