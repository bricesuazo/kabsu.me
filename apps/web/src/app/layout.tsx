import "./globals.css";
import Header from "@/components/Header";
import { getCurrentScheme } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";

import ClientProviders from "./ClientProviders";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const scheme = await getCurrentScheme();
  return (
    <html lang="en" className={scheme === "dark" ? "dark" : ""}>
      <ClerkProvider>
        <ClientProviders>
          <body>
            <Header />
            {children}
          </body>
          <Analytics />
        </ClientProviders>
      </ClerkProvider>
    </html>
  );
}
