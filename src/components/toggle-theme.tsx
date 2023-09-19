"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ToggleTheme({
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { children?: React.ReactNode }) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      {...props}
    >
      <span className="flex items-center dark:hidden">
        <Sun size="1.25rem" />
        <span className="ml-1">Light Mode</span>
      </span>
      <span className=" hidden items-center dark:flex">
        <Moon size="1.25rem" />
        <span className="ml-1">Dark Mode</span>
      </span>
    </Button>
  );
}
