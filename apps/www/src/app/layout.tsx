import "@kabsu.me/tailwind-config/globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";

import QueryProvider from "~/components/query-provider";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { TooltipProvider } from "~/components/ui/tooltip";
import TRPCProvider from "~/lib/trpc/Provider";
import { cn } from "~/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Kabsu.me - Social Media for Cavite State University",
    template: "%s - Kabsu.me",
  },
  description: "Social Media for Cavite State University",
  authors: {
    name: "Brice Suazo",
    url: "https://bricesuazo.com",
  },
  metadataBase: new URL("https://kabsu.me/"),
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(font.className)}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <TooltipProvider>
              <TRPCProvider headers={headers()}>
                {children}
                <Analytics />
                {/* TODO: */}
                {/* {session && <FooterMenu />} */}
              </TRPCProvider>
            </TooltipProvider>

            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
