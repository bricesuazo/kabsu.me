"use client";

import { Button } from "@/components/ui/button";
import { UserButton, currentUser, useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./ui/menubar";
import { useTheme } from "next-themes";
import { Bell, Check, LogOut, Moon, Sun } from "lucide-react";
import { Icons } from "./icons";

export default function Header({ userId }: { userId: string | null }) {
  const { isLoaded, user, isSignedIn } = useUser();
  const { setTheme } = useTheme();
  const { signOut } = useClerk();
  const [loadingSignout, setLoadingSignout] = useState(false);
  const [open, setOpen] = useState("");

  return (
    <header className="flex items-center justify-between py-4">
      <Button variant="link" size="icon" asChild className="px-0">
        <Link href="/">
          <div className="w-max">
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
        </Link>
      </Button>

      <div className="flex items-center gap-x-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full"
          disabled
        >
          <Bell size="1rem" className="" />
        </Button>
        {!isLoaded ? (
          <Skeleton className="m-1 h-8 w-8 rounded-full" />
        ) : (
          isSignedIn && (
            <Menubar asChild value={open}>
              <MenubarMenu value="open">
                <MenubarTrigger
                  className="cursor-pointer rounded-full p-1"
                  onClick={() => setOpen("open")}
                >
                  <div className="relative h-8 w-8">
                    <Image
                      src={user.imageUrl}
                      alt="Image"
                      fill
                      className="rounded-full"
                    />
                  </div>
                </MenubarTrigger>
                <MenubarContent
                  align="end"
                  onInteractOutside={() => setOpen("")}
                >
                  <MenubarItem asChild className="cursor-pointer">
                    <Link href={`/${user?.username}`}>
                      {user?.username ? `@${user?.username}` : "My profile"}
                    </Link>
                  </MenubarItem>
                  <MenubarItem disabled>Account Settings</MenubarItem>

                  <MenubarSeparator />

                  <MenubarSub>
                    <MenubarSubTrigger>
                      <div className="flex flex-1 items-center justify-between">
                        <Sun className="mr-2 block dark:hidden" size="1rem" />
                        <Moon className="mr-2 hidden dark:block" size="1rem" />
                        Theme <MenubarShortcut>⌘ T</MenubarShortcut>
                      </div>
                    </MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem onClick={() => setTheme("light")}>
                        <Check size="1rem" className="mr-2 dark:opacity-0" />
                        Light Mode
                      </MenubarItem>
                      <MenubarItem onClick={() => setTheme("dark")}>
                        <Check
                          size="1rem"
                          className="mr-2 opacity-0 dark:opacity-100"
                        />
                        Dark Mode
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>

                  <MenubarSeparator />

                  <MenubarItem
                    onClick={async () => {
                      setLoadingSignout(true);
                      await signOut();
                      setLoadingSignout(false);
                      setOpen("");
                    }}
                    disabled={loadingSignout}
                  >
                    <div className="mr-2">
                      {loadingSignout ? (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut size="1rem" />
                      )}
                    </div>
                    Sign out
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )
        )}
      </div>
    </header>
  );
}
