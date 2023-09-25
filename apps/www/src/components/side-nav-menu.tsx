"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAVBAR_LINKS } from "@cvsu.me/constants";

import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export default function SideNavMenu() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 max-w-sm pl-4">
      <div className="p-4">
        <p className="text-lg font-semibold">CvSU.me</p>
        <p className="text-muted-foreground">Navigate to different pages</p>
      </div>
      {NAVBAR_LINKS.map((link) => (
        <Fragment key={link.url}>
          <Button
            asChild
            className="w-full justify-start"
            variant={pathname === link.url ? "secondary" : "ghost"}
          >
            <Link
              className="flex gap-x-2"
              href={link.url}
              target={link.url.startsWith("http") ? "_blank" : undefined}
            >
              <link.icon size="1.25rem" />
              {link.name}
            </Link>
          </Button>
          {link.hasSeparator && <Separator className="my-2" />}
        </Fragment>
      ))}
    </div>
  );
}
