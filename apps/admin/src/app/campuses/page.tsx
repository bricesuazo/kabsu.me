import { api } from "@/lib/trpc/server";

import CampusPageWrapper from "./_page";

export default async function CampusPage() {
  const campuses = await api.admin.getAllCampuses.query();
  return <CampusPageWrapper campuses={campuses} />;
}
