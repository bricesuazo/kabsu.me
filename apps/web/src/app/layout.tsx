import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import { getCurrentScheme } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";

import ClientProviders from "./ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const scheme = await getCurrentScheme();
  return (
    <html
      lang="en"
      className={`${scheme === "dark" ? "dark" : ""} ${inter.className}`}
    >
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
