import { redirect } from "next/navigation";

import { createClient } from "@kabsu.me/supabase/client/server";

import Header from "~/components/header";

export default async function AuthenticatedLayout({
  children,
}: React.PropsWithChildren) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");
  return (
    <main className="container flex min-h-screen flex-col border-x p-0">
      <div className="sticky top-0 z-50 border-b">
        <Header />
      </div>
      {children}
    </main>
  );
}
