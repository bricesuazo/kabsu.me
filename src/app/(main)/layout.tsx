import Header from "@/components/header";

export default function MainLayout({ children }: React.PropsWithChildren) {
  return (
    <main className="container">
      <Header />
      {children}
    </main>
  );
}
