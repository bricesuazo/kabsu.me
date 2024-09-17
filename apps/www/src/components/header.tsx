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
  VenetianMask,
} from "lucide-react";
import { useTheme } from "next-themes";

import { HEADER_HEIGHT, NAVBAR_LINKS } from "@kabsu.me/constants";
import { cn } from "@kabsu.me/ui";
import { Button } from "@kabsu.me/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@kabsu.me/ui/dropdown-menu";
import { Label } from "@kabsu.me/ui/label";
import { ScrollArea } from "@kabsu.me/ui/scroll-area";
import { Separator } from "@kabsu.me/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@kabsu.me/ui/sheet";
import { Skeleton } from "@kabsu.me/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kabsu.me/ui/tooltip";

import { api } from "~/lib/trpc/client";
import { createClient } from "~/supabase/client";
import FeedbackForm from "./feedback-form";
import { Icons } from "./icons";
import Notifications from "./notifications";
import Search from "./search";

export default function Header() {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [loadingSignout, setLoadingSignout] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"bug" | "feature">("bug");
  const getCurrentUserQuery = api.auth.getCurrentUser.useQuery();
  const getAllRoomsQuery = api.chats.getAllRooms.useQuery();
  const getAllMyMessagesQuery = api.ngl.getAllMyMessages.useQuery(
    { tab: "messages" },
    { enabled: getCurrentUserQuery.data?.is_ngl_displayed },
  );

  const [openFeedbackForm, setOpenFeedbackForm] = useState(false);
  const router = useRouter();

  const handleFeedbackClick = (feedbackType: "bug" | "feature") => {
    setType(feedbackType);
    setOpenFeedbackForm(true);
  };

  const messagesCount =
    getAllRoomsQuery.data?.filter(
      (room) => (room.rooms_user?.unread_messages_length ?? 0) > 0,
    ).length ?? 0;

  return (
    <>
      <FeedbackForm
        type={type}
        open={openFeedbackForm}
        setOpen={setOpenFeedbackForm}
      />
      <header
        className={cn(
          "sticky top-0 z-50 flex items-center justify-between gap-x-2 bg-background p-4 dark:bg-black sm:dark:bg-[#121212]",
          `h-[${HEADER_HEIGHT}px]`,
        )}
      >
        <div className="flex items-center gap-x-1 xs:gap-x-2">
          <Sheet>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu size="1rem" className="" />
                  </Button>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent>Navigations</TooltipContent>
            </Tooltip>
            <SheetContent side="left">
              <SheetHeader className="mb-4">
                <SheetTitle>Kabsu.me</SheetTitle>
                <SheetDescription>Navigate to different pages</SheetDescription>
              </SheetHeader>
              <div className="flex h-full pb-14">
                <ScrollArea className="flex-grow">
                  {NAVBAR_LINKS.map((link, index) => (
                    <Fragment key={link.url}>
                      {index === NAVBAR_LINKS.length - 9 && (
                        <Label htmlFor="name" className="mb-4 text-right">
                          Quick Links
                        </Label>
                      )}
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
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>

          <Search />

          <div className="size-9">
            {getCurrentUserQuery.data?.is_ngl_displayed && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full"
                    asChild
                  >
                    <Link
                      href="/ngl"
                      className="relative flex w-full items-center"
                    >
                      <VenetianMask size="1rem" />

                      {getAllMyMessagesQuery.data &&
                        getAllMyMessagesQuery.data.length > 0 && (
                          <p className="absolute right-0 top-0 flex aspect-square h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.5rem] text-white">
                            {getAllMyMessagesQuery.data.length}
                          </p>
                        )}
                    </Link>
                  </Button>
                </TooltipTrigger>

                <TooltipContent>NGL</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>Go to the homepage</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-x-1 xs:gap-x-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
                asChild
              >
                <Link href="/chat">
                  <MessageCircle className="size-5" />

                  {messagesCount > 0 && (
                    <p className="absolute right-0 top-0 flex aspect-square h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.5rem] text-white">
                      {messagesCount}
                    </p>
                  )}
                </Link>
              </Button>
            </TooltipTrigger>

            <TooltipContent>Chat</TooltipContent>
          </Tooltip>

          <Notifications />

          {getCurrentUserQuery.isLoading ? (
            <Skeleton className="m-1 h-8 w-8 rounded-full" />
          ) : (
            getCurrentUserQuery.data && (
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>

                  <TooltipContent>Profile</TooltipContent>
                </Tooltip>
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
                    <Link href="/chat" className="flex w-full items-center">
                      <MessageCircle className="mr-2" size="1rem" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  {getCurrentUserQuery.data.is_ngl_displayed && (
                    <DropdownMenuItem
                      asChild
                      className="line-clamp-1 w-full cursor-pointer truncate"
                    >
                      <Link href="/ngl" className="flex w-full items-center">
                        <VenetianMask className="mr-2" size="1rem" />
                        NGL
                      </Link>
                    </DropdownMenuItem>
                  )}
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

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="flex flex-1 items-center">
                        <Sun className="mr-2 block dark:hidden" size="1rem" />
                        <Moon className="mr-2 hidden dark:block" size="1rem" />
                        Theme
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
                      handleFeedbackClick("bug");
                    }}
                  >
                    <AlertTriangle className="mr-2" size="1rem" />
                    Report a problem
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setType("feature");
                      setOpenFeedbackForm(true);
                      handleFeedbackClick("feature");
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
