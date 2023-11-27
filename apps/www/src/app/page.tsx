import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/auth-form";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Icons } from "@/components/icons";
import PostForm from "@/components/post-form";
import PostTypeTab from "@/components/post-type-tab";
import Posts from "@/components/posts";
import { ToggleTheme } from "@/components/toggle-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/trpc/server";
import { Github } from "lucide-react";

import { auth, signIn } from "@cvsu.me/auth";
import { DEVS_INFO } from "@cvsu.me/constants";

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth();

  return {
    title: session
      ? "Home - CvSU.me"
      : "Welcome! - CvSU.me | Social Media for Cavite State University",
  };
}

export default async function Home({
  searchParams: { tab },
}: {
  searchParams: {
    tab?: "all" | "campus" | "program" | "college";
    callback_url?: string;
    [key: string]: string | string[] | undefined;
  };
}) {
  const session = await auth();

  const TABS_TITLE = {
    all: "See posts of all campuses.",
    campus: "See posts of your campus.",
    college: "See posts of your college.",
    program: "See posts of your program.",
  };

  return (
    <main className="container px-0">
      {session &&
      (!session.user.username ||
        !session.user.type ||
        !session.user.program_id) ? (
        <AuthForm session={session} />
      ) : session ? (
        <div className="border-x">
          <div className="sticky top-0 z-50 backdrop-blur-lg">
            <Header />

            <PostTypeTab />
          </div>

          <div className="border-b p-3 text-center sm:hidden">
            <p className="text-sm capitalize text-primary">
              {tab ? tab : "following"} tab
            </p>
            <p className="text-xs text-muted-foreground">
              {tab ? TABS_TITLE[tab] : "See posts of who you are following."}
            </p>
          </div>

          <div className="min-h-screen">
            <PostForm hasRedirect />

            <Posts tab={!tab ? "following" : tab} />
          </div>
        </div>
      ) : (
        <div className="space-y-10 pt-20">
          <div className="space-y-4">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={256}
              height={256}
              priority
              className="pointer-events-none mx-auto select-none"
            />

            <h1 className="text-center text-6xl font-bold text-primary">
              CvSU.me
            </h1>
            <h4 className="text-center text-xl [text-wrap:balance]">
              A social media platform that&apos;s only exclusive for Cavite
              State University students, faculty, and alumni.
            </h4>
            <div>
              <p className="text-center font-bold italic text-primary">
                DISCLAIMER:
              </p>
              <p className="mx-auto max-w-xs text-center italic [text-wrap:balance] ">
                This website is unofficial and not affiliated with Cavite State
                University.
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-center text-xl font-semibold text-primary">
              CvSU.me will shut down for now. :(
            </h2>
            <p className="text-center">
              For more information, please read{" "}
              <Link
                href="https://www.facebook.com/BriceSuazo/posts/pfbid033xuUAobX7btj6uwnt7zxLZx9UWynwdearWVFQTRFs6jqJhMozSoUmuWWqGVhmxp9l"
                className="text-primary underline"
                target="_blank"
              >
                this post
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-y-4 ">
            <div className="flex justify-center">
              <Link
                href="https://github.com/bricesuazo/cvsu.me"
                target="_blank"
              >
                <Badge variant="outline" className="h-8 text-sm">
                  <Github size="1rem" className="mr-1" />
                  Source Code
                </Badge>
              </Link>
            </div>

            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              {/* <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> */}
              <Button>
                <Icons.google className="mr-2 h-4 w-4" />
                Sign in with CvSU Account
              </Button>
            </form>

            {/* {searchParams.error ||
              (searchParams.error_description && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    {searchParams.get("error") ?? "Error"}
                  </AlertTitle>
                  <AlertDescription>
                    {searchParams.get("error_description") ??
                      "Something went wrong."}
                  </AlertDescription>
                </Alert>
              ))} */}

            <ToggleTheme />

            <Suspense
              fallback={<Skeleton className="my-1 h-3 w-36 rounded-full" />}
            >
              <UsersLength />
            </Suspense>
          </div>
          {/* ABOUT DEV COMPONENT */}
          <div>
            <h2 className="py-4 text-center text-4xl font-bold text-primary">
              About
            </h2>
            <p className="mx-auto max-w-lg text-center">
              We are a group of passionate Computer Science students at Cavite
              State University - Main Campus.
            </p>

            <div className="mx-auto mt-4 grid w-fit grid-cols-1 gap-x-20 self-center sm:grid-cols-2">
              {DEVS_INFO.map((dev) => {
                return (
                  <div
                    key={dev.index}
                    className="flex flex-row items-center gap-x-4 rounded-lg p-4"
                  >
                    <Image
                      src={dev.image}
                      alt={dev.name}
                      className="rounded-full saturate-0"
                      width="80"
                      height="80"
                    />
                    <div className="flex flex-col items-start text-left">
                      <p className="font-semibold">{dev.name}</p>
                      <p className="text-sm">{dev.role}</p>
                      <div className="flex gap-x-1 pt-2">
                        {dev.links.map((link, i) => {
                          return (
                            <Link
                              key={i}
                              href={link.url}
                              target="_blank"
                              className="hover:text-primary"
                            >
                              <div className="grid place-items-center p-1">
                                <link.icon size="1rem" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid place-items-center space-y-8">
            <div className="">
              <div className="relative mx-auto aspect-video w-80">
                <Image
                  src="/adventura-logo.png"
                  alt=""
                  fill
                  sizes="100%"
                  className="pointer-events-none hidden select-none object-contain dark:block"
                />
                <Image
                  src="/adventura-logo-dark.png"
                  alt=""
                  fill
                  sizes="100%"
                  className="pointer-events-none select-none object-contain dark:hidden"
                />
              </div>
              <p className="text-center [text-wrap:balance]">
                Adventura is a Visual Novel game that allows the users to
                navigate inside the actual place of Cavite State University
                Indang Campus.
              </p>
            </div>
            <Button asChild>
              <Link href="/adventura">Play Adventura</Link>
            </Button>
          </div>
          <Separator className="mx-auto w-8" />
          <Footer />
        </div>
      )}
    </main>
  );
}

async function UsersLength() {
  const getTotalUsersQuery = await api.users.getTotalUsers.query();
  return (
    <p className="text-center text-sm text-muted-foreground">
      {getTotalUsersQuery} users registered
    </p>
  );
}
