import Header from "@/components/header";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function AuthenticatedLayout({
  children,
}: React.PropsWithChildren) {
  const { userId } = auth();

  if (!userId) redirect(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/");
  return (
    <main className="container">
      <Header />
      {children}
    </main>
  );
}