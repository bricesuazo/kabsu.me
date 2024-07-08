import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Github } from "lucide-react";

import { DEVS_INFO, NEW_FEATURES } from "@kabsu.me/constants";

import Marquee from "~/components/magicui/marquee";
import ShineBorder from "~/components/magicui/shine-border";
import { api } from "~/lib/trpc/server";
import { cn } from "~/lib/utils";
import Footer from "./footer";
import SigninButton from "./signin-button";
import { ToggleTheme } from "./toggle-theme";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

export default function HomePublic({ error }: { error?: string }) {
  return (
    <div className="space-y-10 px-8 pt-20">
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
          Kabsu.me
        </h1>
        <h4 className="text-balance text-center text-xl">
          A social media platform that&apos;s only exclusive for Cavite State
          University students, faculty, and alumni.
        </h4>
        <div>
          <p className="text-center font-bold italic text-primary">
            DISCLAIMER:
          </p>
          <p className="mx-auto max-w-xs text-balance text-center italic">
            This website is not affiliated with Cavite State University.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-y-4">
        <div className="flex justify-center">
          <Link href="https://github.com/bricesuazo/kabsu.me" target="_blank">
            <Badge variant="outline" className="h-8 text-sm">
              <Github size="1rem" className="mr-1" />
              Source Code
            </Badge>
          </Link>
        </div>

        <SigninButton />

        {error && (
          <Alert variant="destructive" className="mx-auto max-w-xs">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {error === "AccessDenied"
                ? "Access Denied"
                : error === "StagingAccessDenied"
                  ? "Unauthorized"
                  : "Error"}
            </AlertTitle>
            <AlertDescription>
              {error === "AccessDenied"
                ? "Please use your CvSU email address. You must be a CvSU student, faculty, or alumni to access this site."
                : error === "StagingAccessDenied"
                  ? "You are not authorized to access this site. Please contact the developer for more information."
                  : "An error occured."}
            </AlertDescription>
          </Alert>
        )}

        {/* <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-center">Under maintenance</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center">
                <p className="text-balance text-center">
                  Kabsu.me will shut down for now.
                </p>
                <div className="mx-auto">
                  <Button asChild variant="link">
                    <Link
                      href="https://www.facebook.com/bricesuazo/posts/pfbid0zDT9dsbGjub5b9WqKBNTDhMj3jUyCLGGXN6PuVvHWMntRRqgq3MztVWvMyjKBt8il"
                      target="_blank"
                    >
                      Read more
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card> */}

        <ToggleTheme />

        <Suspense
          fallback={<Skeleton className="my-1 h-3 w-36 rounded-full" />}
        >
          <UsersLength />
        </Suspense>
      </div>

      {/* <iframe
        src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fbricesuazo%2Fposts%2Fpfbid0brFggarFZmEkXR57W7xZAGGk6JWJQv5kt5LxJUK2omdEqouYfiYz25tZGiDVY1fXl&show_text=true"
        className="aspect-square w-full overflow-hidden border-0 border-none"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      /> */}

      <div className="relative flex flex-col gap-y-1">
        <Marquee pauseOnHover className="[--duration:30s]">
          {NEW_FEATURES.map((feature) => {
            return (
              <ShineBorder
                key={feature.index}
                className="flex w-full flex-col items-center justify-center rounded-sm bg-green-50/50 p-4 hover:bg-green-50 dark:bg-green-950/10 hover:dark:bg-green-950/50"
                color={["#41B75E50", "#227B3C50"]}
              >
                <p className="text-primary">
                  <feature.icon className="size-14" />
                </p>
                <p className="text-xl font-bold text-primary">
                  {feature.title}
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </ShineBorder>
            );
          })}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:30s]">
          {[...NEW_FEATURES.reverse()].map((feature) => {
            return (
              <ShineBorder
                key={feature.index}
                className="flex w-full flex-col items-center justify-center rounded-sm bg-green-50/50 p-4 hover:bg-green-50 dark:bg-green-950/10 hover:dark:bg-green-950/50"
                color={["#41B75E50", "#227B3C50"]}
              >
                <p className="text-primary">
                  <feature.icon className="size-14" />
                </p>
                <p className="text-xl font-bold text-primary">
                  {feature.title}
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </ShineBorder>
            );
          })}
        </Marquee>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-[#121212]"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-[#121212]"></div>
      </div>

      {/* ABOUT DEV COMPONENT */}
      <div>
        <h2 className="py-4 text-center text-4xl font-bold text-primary">
          About
        </h2>
        <p className="mx-auto max-w-lg text-center">
          We are a group of passionate Computer Science students at Cavite State
          University - Main Campus.
        </p>

        <div className="mx-auto mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {DEVS_INFO.map((dev) => {
            return (
              <div
                key={dev.index}
                className="flex flex-col items-center gap-y-4 rounded-lg border-2 p-3"
              >
                <Image
                  src={dev.image}
                  alt={dev.name}
                  className="aspect-square rounded-full object-cover object-center saturate-0"
                  width="80"
                  height="80"
                />
                <div className="flex flex-col items-center text-center">
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
          <p className="text-balance text-center">
            Adventura is a Visual Novel game that allows the users to navigate
            inside the actual place of Cavite State University Indang Campus.
          </p>
        </div>
        <Button asChild>
          <Link href="/adventura">Play Adventura</Link>
        </Button>
      </div>
      <Separator className="mx-auto w-8" />
      <Footer />
    </div>
  );
}

async function UsersLength() {
  const getTotalUsersQuery = await api.users.getTotalUsers.query();
  return (
    <p className="text-center text-sm text-muted-foreground">
      {getTotalUsersQuery} Kabsuhenyos registered
    </p>
  );
}
