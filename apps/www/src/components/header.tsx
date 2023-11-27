"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/trpc/client";
import { NAVBAR_LINKS } from "@kabsu.me/constants";
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

import FeedbackForm from "./feedback-form";
import { Icons } from "./icons";
import Notifications from "./notifications";
import Search from "./search";
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
  const [open, setOpen] = useState(false);
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
              <DropdownMenu open={open}>
                <DropdownMenuTrigger
                  className="cursor-pointer rounded-full p-1"
                  onClick={() => setOpen(!open)}
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
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onInteractOutside={() => setOpen(!open)}
                  className="w-52"
                >
                  <DropdownMenuItem
                    asChild
                    className="line-clamp-1 w-full cursor-pointer truncate"
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
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <UserCog className="mr-2" size="1rem" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="flex flex-1 items-center justify-between">
                        <Sun className="mr-2 block dark:hidden" size="1rem" />
                        <Moon className="mr-2 hidden dark:block" size="1rem" />
                        Theme <DropdownMenuShortcut>⌘ T</DropdownMenuShortcut>
                      </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Check size="1rem" className="mr-2 dark:opacity-0" />
                        Light Mode
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Check
                          size="1rem"
                          className="mr-2 opacity-0 dark:opacity-100"
                        />
                        Dark Mode
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      setType("bug");
                      setOpenFeedbackForm(true);
                      setOpen(false);
                    }}
                  >
                    <AlertTriangle className="mr-2" size="1rem" />
                    Report a problem
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setType("feature");
                      setOpenFeedbackForm(true);
                      setOpen(false);
                    }}
                  >
                    <MousePointerSquare className="mr-2" size="1rem" />
                    Suggest a feature
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <form
                    action={async () => {
                      setLoadingSignout(true);
                      await signOut();
                      setOpen(false);
                      setLoadingSignout(false);
                    }}
                  >
                    <DropdownMenuItem asChild>
                      <button className="mr-2 flex w-full gap-x-2">
                        {loadingSignout ? (
                          <Icons.spinner className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut size="1rem" />
                        )}
                        Sign out
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </div>
      </header>
    </>
  );
}
