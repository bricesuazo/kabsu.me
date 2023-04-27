import "./globals.css";
import ClientProviders from "./client-providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ClientProviders>
        <body>{children}</body>
      </ClientProviders>
    </html>
  );
}
