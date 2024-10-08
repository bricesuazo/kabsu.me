import React from "react";
import Link from "next/link";
import { Bell, Home, MessageSquare, Search } from "lucide-react";

import { Button } from "@kabsu.me/ui/button";

export default function FooterMenu() {
  return (
    <div className="container sticky bottom-0 flex h-auto w-full items-center justify-center border-t bg-background/80 p-4 backdrop-blur-lg sm:hidden">
      <div className="flex w-full justify-center">
        <Button
          size="icon"
          variant="ghost"
          className="relative h-9 w-9 rounded-full"
          asChild
        >
          <Link href="/">
            <Home size="1.25rem" />
          </Link>
        </Button>
      </div>

      <div className="flex w-full justify-center">
        <Button
          size="icon"
          variant="ghost"
          className="relative h-9 w-9 rounded-full"
          asChild
        >
          <Link href="/search" className="text-center text-xs">
            <Search size="1.25rem" />
          </Link>
        </Button>
      </div>

      <div className="flex w-full justify-center">
        <Button
          asChild
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary p-4"
        >
          <Link href="/new">
            <p className="text-2xl text-foreground">+</p>
          </Link>
        </Button>
      </div>

      <div className="flex w-full justify-center text-muted">
        <MessageSquare size="1.25rem" />
      </div>

      <div className="flex w-full justify-center">
        <Button
          size="icon"
          variant="ghost"
          className="relative h-9 w-9 rounded-full"
          asChild
        >
          <Link href="/notifications" className="text-center text-xs">
            <Bell size="1.25rem" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
