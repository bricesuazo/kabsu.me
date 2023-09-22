"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ToggleTheme({
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { children?: React.ReactNode }) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      {...props}
      size="icon"
    >
      <Sun className="flex h-4 w-4 items-center dark:hidden" />

      <Moon className="hidden h-4 w-4 items-center dark:flex" />
    </Button>
  );
}
