"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/client";
import {
  AlertTriangle,
  AtSign,
  Check,
  LogOut,
  Menu,
  Moon,
  MousePointerSquare,
  Sun,
  UserCog,
} from "lucide-react";
import { useTheme } from "next-themes";

import { NAVBAR_LINKS } from "@cvsu.me/constants";

import FeedbackForm from "./feedback-form";
import { Icons } from "./icons";
import Notifications from "./notifications";
import Search from "./search";
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
import { Separator } from "./ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Skeleton } from "./ui/skeleton";

export default function Header() {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [loadingSignout, setLoadingSignout] = useState(false);
  const [open, setOpen] = useState("");
  const [type, setType] = useState<"bug" | "feature">("bug");
  const sessionQuery = api.auth.getCurrentSession.useQuery();

  const [openFeedbackForm, setOpenFeedbackForm] = useState(false);

  return (
    <>
      <FeedbackForm
        type={type}
        open={openFeedbackForm}
        setOpen={setOpenFeedbackForm}
      />
      <header className="sticky top-0 z-50 flex items-center justify-between gap-x-2 p-4 backdrop-blur-lg">
        <div className="flex items-center gap-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size="1rem" className="" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="mb-4">
                <SheetTitle>Kabsu.me</SheetTitle>
                <SheetDescription>Navigate to different pages</SheetDescription>
              </SheetHeader>

              {NAVBAR_LINKS.map((link) => (
                <Fragment key={link.url}>
                  <Button
                    asChild
                    className="w-full justify-start"
                    variant={pathname === link.url ? "secondary" : "ghost"}
                    // size="sm"
                  >
                    <SheetClose asChild>
                      <Link
                        className="flex gap-x-2"
                        href={link.url}
                        target={
                          link.url.startsWith("http") ? "_blank" : undefined
                        }
                      >
                        <link.icon size="1.25rem" />
                        {link.name}
                      </Link>
                    </SheetClose>
                  </Button>
                  {link.hasSeparator && <Separator className="my-2" />}
                </Fragment>
              ))}
            </SheetContent>
          </Sheet>

          <div className="hidden sm:block">
            <Search />
          </div>
        </div>
        <Button variant="link" size="icon" asChild className="px-0">
          <Link href="/">
            <div className="w-max">
              <Image
                src="/logo.svg"
                alt=""
                width={40}
                height={40}
                priority
                className="object-cover"
              />
            </div>
          </Link>
        </Button>

        <div className="flex items-center gap-x-2">
          <div className="hidden sm:block">
            <Notifications />
          </div>

          {sessionQuery.isLoading ? (
            <Skeleton className="m-1 h-8 w-8 rounded-full" />
          ) : (
            sessionQuery.data && (
              <Menubar asChild value={open}>
                <MenubarMenu value="open">
                  <MenubarTrigger
                    className="cursor-pointer rounded-full p-1"
                    onClick={() => setOpen("open")}
                  >
                    <div className="relative h-8 w-8">
                      <Image
                        src={
                          sessionQuery.data.user.image
                            ? sessionQuery.data.user.image
                            : "/default-avatar.jpg"
                        }
                        alt="Image"
                        fill
                        sizes="100%"
                        className="rounded-full object-cover"
                      />
                    </div>
                  </MenubarTrigger>
                  <MenubarContent
                    align="end"
                    onInteractOutside={() => setOpen("")}
                    className="max-w-[2rem]"
                  >
                    <MenubarItem
                      asChild
                      className="line-clamp-1 w-full cursor-pointer truncate"
                      onClick={() => setOpen("")}
                    >
                      <Link
                        href={`/${sessionQuery.data.user.username}`}
                        className="w-full"
                      >
                        <AtSign className="mr-2" size="1rem" />
                        {sessionQuery.data.user.username?.length
                          ? `${sessionQuery.data.user.username}`
                          : "My Profile"}
                      </Link>
                    </MenubarItem>
                    <MenubarItem asChild onClick={() => setOpen("")}>
                      <Link href="/account">
                        <UserCog className="mr-2" size="1rem" />
                        Account Settings
                      </Link>
                    </MenubarItem>

                    <MenubarSeparator />

                    <MenubarSub>
                      <MenubarSubTrigger>
                        <div className="flex flex-1 items-center justify-between">
                          <Sun className="mr-2 block dark:hidden" size="1rem" />
                          <Moon
                            className="mr-2 hidden dark:block"
                            size="1rem"
                          />
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
                      onClick={() => {
                        setType("bug");
                        setOpenFeedbackForm(true);
                      }}
                    >
                      <AlertTriangle className="mr-2" size="1rem" />
                      Report a problem
                    </MenubarItem>
                    <MenubarItem
                      onClick={() => {
                        setType("feature");
                        setOpenFeedbackForm(true);
                      }}
                    >
                      <MousePointerSquare className="mr-2" size="1rem" />
                      Suggest a feature
                    </MenubarItem>

                    <MenubarSeparator />

                    <form
                      action={async () => {
                        setLoadingSignout(true);
                        await signOut();
                        setLoadingSignout(false);
                        setOpen("");
                      }}
                    >
                      <MenubarItem disabled={loadingSignout} asChild>
                        <button className="mr-2">
                          {loadingSignout ? (
                            <Icons.spinner className="h-4 w-4 animate-spin" />
                          ) : (
                            <LogOut size="1rem" />
                          )}
                        </button>
                        Sign out
                      </MenubarItem>
                    </form>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            )
          )}
        </div>
      </header>
    </>
  );
}
