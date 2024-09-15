import Header from "~/components/header";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <main>
      <div className="mx-auto max-w-3xl border-x border-transparent">
        <Header />
      </div>
      <div className="container py-10">{children}</div>
    </main>
  );
}
