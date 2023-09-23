import React from "react";
import Link from "next/link";
import { Home, MessageSquare, Search } from "lucide-react";

import Notifications from "./notifications";

export default function FooterMenu() {
  return (
    <div className="container sticky bottom-0 flex h-auto w-full items-center justify-center border-t bg-background/80 p-4 backdrop-blur-lg sm:hidden">
      <div className="flex w-full justify-center">
        <Link href="/">
          <Home size="1.25rem" />
        </Link>
      </div>

      <div className="flex w-full justify-center text-muted">
        <Search size="1.25rem" />
      </div>

      <div className="flex w-full justify-center">
        <Link href="/new">
          <p className="flex h-12 w-12 items-center justify-center rounded-full bg-primary p-4 text-2xl text-foreground">
            +
          </p>
        </Link>
      </div>

      <div className="flex w-full justify-center text-muted">
        <MessageSquare size="1.25rem" />
      </div>

      <div className="flex w-full justify-center">
        <Link href="/notifications" className="text-center text-xs">
          <Notifications />
        </Link>
      </div>
    </div>
  );
}
