import Header from "~/components/header";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="container min-h-screen border-x p-0">
      <div className="sticky top-0 z-50 border-b">
        <Header />
      </div>
      <div className="container py-10">{children}</div>
    </div>
  );
}
