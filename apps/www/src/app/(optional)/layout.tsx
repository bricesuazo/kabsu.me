import Header from "@/components/header";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <main className="container">
      <Header />
      <div className="py-10">{children}</div>
    </main>
  );
}
