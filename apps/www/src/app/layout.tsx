import "@cvsu.me/tailwind-config/globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import FooterMenu from "@/components/footer-menu";
import QueryProvider from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TrpcProvider from "@/lib/trpc/Provider";
import { cn } from "@/lib/utils";
import { auth, ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";

const font = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "CvSU.me - Social Media for Cavite State University",
    template: "%s - CvSU.me",
  },
  description: "Social Media for Cavite State University",
  authors: {
    name: "Brice Suazo",
    url: "https://bricesuazo.com",
  },
  metadataBase: new URL("https://cvsu.me/"),
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  const { userId } = auth();
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(font.className)}>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              <TooltipProvider>
                <TrpcProvider>
                  {children}
                  <Analytics />
                  {userId && <FooterMenu />}
                </TrpcProvider>
              </TooltipProvider>

              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
