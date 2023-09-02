"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ToggleTheme() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="dark:hidden block" size="1.25rem" />
      <Moon className="hidden dark:block" size="1.25rem" />
    </Button>
  );
}
