import { redirect } from "next/navigation";

import Header from "~/components/header";
import { createClient } from "~/supabase/server";

export default async function AuthenticatedLayout({
  children,
}: React.PropsWithChildren) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/");
  return (
    <>
      <main className="container min-h-screen border-x p-0">
        <div className="sticky top-0 z-50 border-b">
          <Header />
        </div>
        {children}
      </main>
    </>
  );
}
