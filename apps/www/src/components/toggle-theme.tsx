"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "~/components/ui/button";

export function ToggleTheme({
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { children?: React.ReactNode }) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-full"
      {...props}
    >
      <div className="flex items-center dark:hidden">
        <Sun size="1.25rem" />
        <span className="ml-1">Light Mode</span>
      </div>
      <div className="hidden items-center dark:flex">
        <Moon size="1.25rem" />
        <span className="ml-1">Dark Mode</span>
      </div>
    </Button>
  );
}
