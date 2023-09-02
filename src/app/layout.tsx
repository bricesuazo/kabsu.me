import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider, UserButton, currentUser } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { ToggleTheme } from "@/components/toggle-theme";
import Auth from "@/components/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const font = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CvSU.me - Social Media for Cavite State University",
  description: "Social Media for Cavite State University",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={font.className}>
          <ThemeProvider attribute="class" defaultTheme="light">
            <div className="container">
              {user ? (
                <>
                  <header className="flex items-center justify-between py-4">
                    <Button variant="link" asChild className="px-0">
                      <Link href="/">CvSU.me</Link>
                    </Button>
                    <div className="flex items-center gap-x-2">
                      <ToggleTheme />
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </header>
                  {children}
                </>
              ) : (
                <Auth />
              )}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
