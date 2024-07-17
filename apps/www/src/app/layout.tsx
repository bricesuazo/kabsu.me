import "~/globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { TRPCReactProvider } from "~/lib/trpc/client";
import { cn } from "~/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// export const runtime = "edge";
// export const dynamic = "force-dynamic";

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
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider>
            <TRPCReactProvider>
              {children}

              <Analytics />
              {/* TODO: */}
              {/* {session && <FooterMenu />} */}
            </TRPCReactProvider>
          </TooltipProvider>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
