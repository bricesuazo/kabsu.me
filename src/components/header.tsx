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
import { Bell, Check, LogOut, Menu, Moon, Sun } from "lucide-react";
import { Icons } from "./icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

export default function Header() {
  // { userId }: { userId: string | null }
  const { isLoaded, user, isSignedIn } = useUser();
  const { setTheme } = useTheme();
  const { signOut } = useClerk();
  const [loadingSignout, setLoadingSignout] = useState(false);
  const [open, setOpen] = useState("");
  return (
    <header className="flex items-center justify-between py-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu size="1rem" className="" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Test</SheetTitle>
            <SheetDescription>
              I still don`&apos;t know what to put here :)
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full"
            >
              <Bell size="1rem" className="" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2" align="end">
            <h3 className="flex items-center gap-x-2 p-2 font-semibold">
              <Bell size="1rem" />
              Notifications
            </h3>
            <ScrollArea className="h-80">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="flex items-center gap-x-2 p-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </ScrollArea>
          </PopoverContent>
        </Popover>

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
                  <MenubarItem
                    asChild
                    className="cursor-pointer"
                    onClick={() => setOpen("")}
                  >
                    <Link href={`/${user?.username}`}>
                      {user?.username ? `@${user?.username}` : "My profile"}
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild onClick={() => setOpen("")}>
                    <Link href="/account">Account Settings</Link>
                  </MenubarItem>

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
