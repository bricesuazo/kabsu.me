import { notFound } from "next/navigation";

import { api } from "~/lib/trpc/server";
import ProfFinderPageClient from "./page.client";

export default async function ProfFinderPage() {
  const current_user = await api.auth.getCurrentUser();

  if (current_user.type === "alumni") notFound();
  return <ProfFinderPageClient />;
}
