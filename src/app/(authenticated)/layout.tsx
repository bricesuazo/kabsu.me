import RefreshPage from "@/components/RefreshPage";
import Header from "@/components/header";
import { env } from "@/lib/env.mjs";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function AuthenticatedLayout({
  children,
}: React.PropsWithChildren) {
  const { userId } = auth();

  if (!userId) redirect(env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/");
  return (
    <>
      <RefreshPage />
      <main className="container">
        <Header />

        {children}
      </main>
    </>
  );
}
