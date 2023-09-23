import { redirect } from "next/navigation";
import Header from "@/components/header";
import { env } from "@/lib/env.mjs";
import { auth } from "@clerk/nextjs";

export default function AuthenticatedLayout({
  children,
}: React.PropsWithChildren) {
  const { userId } = auth();

  if (!userId) redirect(env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/");
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
