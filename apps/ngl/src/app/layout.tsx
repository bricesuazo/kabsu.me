import "./globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { TRPCReactProvider } from "~/lib/trpc/client";
import { cn } from "~/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "NGL Kabsu.me",
  description: "NGL Kabsu.me",
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className={cn(font.className)}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
