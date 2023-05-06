"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleScheme } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";

function ThemeButton() {
  const router = useRouter();
  return (
    <Button
      className="h-8 w-8 rounded-full"
      onClick={async () => {
        await toggleScheme();
        router.refresh();
      }}
    >
      <span className="inline-block text-zinc-100 dark:hidden">
        <MoonIcon className="w-5" />
      </span>
      <span className="hidden text-zinc-800 dark:inline-block">
        <SunIcon className="w-5" />
      </span>
    </Button>
  );
}

export default ThemeButton;
