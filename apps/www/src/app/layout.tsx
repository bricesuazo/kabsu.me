import "./globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import QueryProvider from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TrpcProvider from "@/lib/trpc/Provider";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

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
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(font.className)}>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              <TooltipProvider>
                <div>
                  <TrpcProvider>{children}</TrpcProvider>
                </div>
              </TooltipProvider>

              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
