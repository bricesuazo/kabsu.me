"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  AtSign,
  Check,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  SquareMousePointer,
  Sun,
  UserCircle,
} from "lucide-react";
import { useTheme } from "next-themes";

import { HEADER_HEIGHT, NAVBAR_LINKS } from "@kabsu.me/constants";

import { Button } from "~/components/ui/button";
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
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { api } from "~/lib/trpc/client";
import { cn } from "~/lib/utils";
import { createClient } from "~/supabase/client";
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
  const getCurrentUserQuery = api.auth.getCurrentUser.useQuery();

  const [openFeedbackForm, setOpenFeedbackForm] = useState(false);
  const router = useRouter();

  return (
    <>
      <FeedbackForm
        type={type}
        open={openFeedbackForm}
        setOpen={setOpenFeedbackForm}
      />
      <header
        className={cn(
          "sticky top-0 z-50 flex items-center justify-between gap-x-2 p-4 backdrop-blur-lg",
          `h-[${HEADER_HEIGHT}px]`,
        )}
      >
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

              {NAVBAR_LINKS.map((link, index) => (
                <Fragment key={link.url}>
                  {index === NAVBAR_LINKS.length - 6 && (
                    <Label htmlFor="name" className="mb-4 text-right">
                      Partnership
                    </Label>
                  )}

                  <Button
                    asChild
                    className="w-full justify-start"
                    variant={pathname === link.url ? "secondary" : "ghost"}
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
                        <p className="truncate">{link.name}</p>
                      </Link>
                    </SheetClose>
                  </Button>

                  {link.hasSeparator && <Separator className="my-2" />}
                </Fragment>
              ))}
            </SheetContent>
          </Sheet>

          <Search />
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
          <Notifications />

          {getCurrentUserQuery.isLoading ? (
            <Skeleton className="m-1 h-8 w-8 rounded-full" />
          ) : (
            getCurrentUserQuery.data && (
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger className="cursor-pointer rounded-full p-1">
                  <div className="relative h-8 w-8">
                    <Image
                      src={
                        getCurrentUserQuery.data.image_name
                          ? getCurrentUserQuery.data.image_url
                          : "/default-avatar.jpg"
                      }
                      alt="Image"
                      width={40}
                      height={40}
                      className="aspect-square rounded-full object-cover object-center"
                    />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52">
                  <DropdownMenuItem
                    asChild
                    className="line-clamp-1 w-full cursor-pointer truncate"
                  >
                    <Link
                      href={`/${getCurrentUserQuery.data.username}`}
                      className="flex w-full items-center"
                    >
                      <AtSign className="mr-2" size="1rem" />
                      {getCurrentUserQuery.data.username.length
                        ? `${getCurrentUserQuery.data.username}`
                        : "My Profile"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="line-clamp-1 w-full cursor-pointer truncate"
                  >
                    <Link href="/account" className="flex w-full items-center">
                      <UserCircle className="mr-2" size="1rem" />
                      Account settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    asChild
                    className="line-clamp-1 w-full cursor-pointer truncate"
                  >
                    <Link href="/messages" className="flex w-full items-center">
                      <MessageCircle className="mr-2" size="1rem" />
                      Messages
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
                    }}
                  >
                    <AlertTriangle className="mr-2" size="1rem" />
                    Report a problem
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setType("feature");
                      setOpenFeedbackForm(true);
                    }}
                  >
                    <SquareMousePointer className="mr-2" size="1rem" />
                    Suggest a feature
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="mr-2 flex w-full gap-x-2"
                    disabled={loadingSignout}
                    onClick={async () => {
                      setLoadingSignout(true);
                      const supabase = createClient();
                      await supabase.auth.signOut();
                      router.refresh();
                    }}
                  >
                    {loadingSignout ? (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut size="1rem" />
                    )}
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </div>
      </header>
    </>
  );
}
