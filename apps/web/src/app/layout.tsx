import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";

import ClientProviders from "./ClientProviders";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <ClientProviders>
          <body>
            <Header />
            {children}
          </body>
          <Analytics />
        </ClientProviders>
      </html>
    </ClerkProvider>
  );
}
