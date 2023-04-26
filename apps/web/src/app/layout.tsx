import ClientProviders from "./client-providers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <div>layout{children}</div>
    </ClientProviders>
  );
}
