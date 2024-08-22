import { notFound } from "next/navigation";

import { api } from "~/lib/trpc/server";
import NGLPageClient from "./_components/client";

export default async function NGLPage() {
  const [isMyNGLDisplayed, getMyUsername] = await Promise.all([
    api.auth.isMyNGLDisplayed(),
    api.auth.getMyUsername(),
  ]);

  if (!isMyNGLDisplayed) notFound();

  return <NGLPageClient username={getMyUsername} />;
}
