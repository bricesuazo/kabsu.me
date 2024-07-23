import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Github } from "lucide-react";

import { DEVS_INFO, NEW_FEATURES } from "@kabsu.me/constants";

import { BentoCard, BentoGrid } from "~/components/magicui/bento-grid";
import Marquee from "~/components/magicui/marquee";
import Ripple from "~/components/magicui/ripple";
import ShineBorder from "~/components/magicui/shine-border";
import { api } from "~/lib/trpc/server";
import Footer from "./footer";
import NumberTicker from "./magicui/number-ticker";
import SigninButton from "./signin-button";
import { ToggleTheme } from "./toggle-theme";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const THESIS_INFO = [
  {
    Icon: (
      <Image
        alt="adventura-logo-img"
        src="/thesis-pics/adventura-logo.png"
        width={1000}
        height={1000}
      />
    ),
    name: "Adventura 360°",
    description:
      "An Interactive Campus Tour for Cavite State University Don Severino Delas Alas Campus.",
    className: "col-span-5 lg:col-span-2",
    href: "https://adventura360.kabsu.me/",
    cta: "Learn more",
    background: (
      <Image
        alt="adventura-background-img"
        src="/thesis-pics/adventura-background.png"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover object-top [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]"
      />
    ),
  },
  {
    Icon: (
      <Image
        alt="arctec-logo-img"
        src="/thesis-pics/arctec-logo.png"
        width={1000}
        height={1000}
      />
    ),
    name: "ARCTEC",
    description: "Augmented Reality for CvSU Ladislao N. Diwa Memorial Library",
    className: "col-span-5 lg:col-span-2",
    href: "https://arctec.kabsu.me/",
    cta: "Learn more",
    background: (
      <Image
        alt="arctec-background-img"
        src="/thesis-pics/arctec-background.png"
        width={1000}
        height={1000}
        className="absolute top-0 h-full w-full object-cover [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]"
      />
    ),
  },
  {
    Icon: (
      <Image
        alt="chromia-logo-img"
        src="/thesis-pics/chromia-logo.png"
        width={1000}
        height={1000}
      />
    ),
    name: "CHROMIA",
    description: "A Speech Command HCI Design for Google Chrome",
    className: "col-span-5 lg:col-span-1",
    href: "https://chromia.kabsu.me/",
    cta: "Learn more",
    background: (
      <Image
        alt="chromia-background-img"
        src="/thesis-pics/chromia-background.png"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover object-top [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]"
      />
    ),
  },
  {
    Icon: (
      <Image
        alt="ebnoto-logo-img"
        src="/thesis-pics/eboto-logo.png"
        width={1000}
        height={1000}
      />
    ),
    name: "eBoto",
    description: "One Stop Online Voting Solution",
    className: "col-span-5 lg:col-span-1",
    href: "https://eboto.app/",
    cta: "Learn more",
    background: (
      <Image
        alt="eboto-background-img"
        src="/thesis-pics/eboto-background.png"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover object-top [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]"
      />
    ),
  },
  {
    Icon: (
      <Image
        alt="odyssey-logo-img"
        src="/thesis-pics/odyssey-logo.png"
        width={1000}
        height={1000}
      />
    ),
    name: "Odyssey",
    description:
      "An Android-Based Mobile Augmented Reality Application for Interactive Experience at CvSU Historical and Cultural Museum",
    className: "col-span-5 lg:col-span-2",
    href: "https://odyssey.kabsu.me/",
    cta: "Learn more",
    background: (
      <Image
        alt="odyssey-background-img"
        src="/thesis-pics/odyssey-background.png"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover object-top [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]"
      />
    ),
  },
  {
    Icon: (
      <Image
        alt="swardify-logo-img"
        src="/thesis-pics/swardify-logo.png"
        width={1000}
        height={1000}
      />
    ),
    name: "SWARDify",
    description: "A Bidirectional Swardspeak and Tagalog Translator",
    className: "col-span-5 lg:col-span-2",
    href: "https://swardify.kabsu.me/",
    cta: "Learn more",
    background: (
      <Image
        alt="swardify-background-img"
        src="/thesis-pics/swardify-background.png"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover object-top [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]"
      />
    ),
  },
];

export default function HomePublic({ error }: { error?: string }) {
  return (
    <div className="bg-background">
      {/* NAV BAR */}
      <nav className="fixed z-50 w-full border-b bg-background px-1 py-4 sm:p-4">
        <div className="container flex max-w-screen-xl items-center justify-between">
          <Link href="/" className="flex items-center gap-x-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={40}
              height={40}
              priority
              className="w-9 xs:w-10"
            />
            <h1 className="text-md text-center font-semibold xs:text-2xl">
              Kabsu.me
            </h1>
          </Link>
          <div className="flex items-center gap-x-0 sm:gap-x-2">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  asChild
                >
                  <Link
                    href="https://github.com/bricesuazo/kabsu.me"
                    target="_blank"
                  >
                    <Github size="1.25rem" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Source Code</TooltipContent>
            </Tooltip>

            <ToggleTheme />
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="container relative flex min-h-screen w-full max-w-screen-xl items-center justify-center overflow-hidden px-0">
        <Ripple />
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-y-8 px-4 lg:gap-y-12">
          <h1 className="text-balance text-center text-5xl font-semibold text-primary dark:text-white lg:text-7xl">
            Exclusive Social Hub for Cavite State University
          </h1>
          <h4 className="max-w-screen-md text-balance text-center lg:text-xl">
            A social media platform that&apos;s only exclusive for Cavite State
            University students, faculty, and alumni.
          </h4>

          <div className="flex flex-col gap-y-4">
            <div className="mx-auto">
              <SigninButton />
            </div>

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

            <Suspense
              fallback={
                <Skeleton className="mx-auto my-1 h-3 w-56 rounded-full" />
              }
            >
              <UsersLength />
            </Suspense>
          </div>
        </div>
        <p className="absolute bottom-0 mx-auto w-full text-balance py-8 text-center text-sm text-muted-foreground">
          This website is not affiliated with Cavite State University.
        </p>
      </div>

      {/* FEATURES SECTION */}
      <div className="space-y-10 py-10">
        <h1 className="text-center text-4xl font-bold text-primary">
          New Features
        </h1>

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

          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
        </div>
      </div>

      {/* PARTNERSHIPS SECTION */}
      <div className="container max-w-screen-xl space-y-10">
        <h1 className="text-center text-4xl font-bold text-primary">
          Partnerships
        </h1>

        <div className="">
          <BentoGrid className="grid grid-cols-5">
            {THESIS_INFO.map((thesis) => {
              return <BentoCard {...thesis} />;
            })}
          </BentoGrid>
        </div>

        {/* ABOUT DEV COMPONENT */}
        <div>
          <h2 className="py-4 text-center text-4xl font-bold text-primary">
            Development Team
          </h2>
          <p className="mx-auto max-w-lg text-center">
            We are a group of passionate Computer Science students at Cavite
            State University - Main Campus.
          </p>

          <div className="mx-auto mt-4 grid grid-cols-1 gap-4 rounded-lg border-2 p-4 md:grid-cols-3 lg:grid-cols-5">
            {DEVS_INFO.map((dev) => {
              return (
                <div
                  key={dev.index}
                  className="flex flex-col items-center gap-y-4 rounded-lg p-3"
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
        <div>
          <Separator className="mx-auto w-8" />
          <Footer />
        </div>
      </div>
    </div>
  );
}

async function UsersLength() {
  const getTotalUsersQuery = await api.users.getTotalUsers();
  return (
    <p className="flex items-center justify-center gap-x-1 text-center text-sm text-muted-foreground">
      {getTotalUsersQuery === 0 ? (
        <span>0</span>
      ) : (
        <NumberTicker value={getTotalUsersQuery} />
      )}
      Kabsuhenyos registered
    </p>
  );
}
