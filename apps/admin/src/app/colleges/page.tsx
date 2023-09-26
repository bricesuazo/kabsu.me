import { api } from "@/lib/trpc/server";

import CollegesPageWrapper from "./_page";

export default async function CollegesPage() {
  const campuses = await api.admin.getAllColleges.query();
  return <CollegesPageWrapper campuses={campuses} />;
}
