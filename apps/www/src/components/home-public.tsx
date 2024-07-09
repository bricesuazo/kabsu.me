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
    className:
      "col-span-5 lg:col-span-2 bg-gradient-to-tr from-[#5EA55925] to-[#616F6025]",
    href: "https://adventura360.kabsu.me/",
    cta: "Learn more",
    background: (
      <Image
        alt="adventura-background-img"
        src="/thesis-pics/adventura-background.png"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover [--duration:20s] [mask-image:linear-gradient(to_top,transparent_0%,#000_100%)]"
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
    className:
      "col-span-5 lg:col-span-2 bg-gradient-to-tr from-[#5D6C6425] to-[#4C956C25]",
    href: "https://arctec.kabsu.me/",
    cta: "Learn more",
    background: (
      <Image
        alt="arctec-background-img"
        src="/thesis-pics/arctec-background.png"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover [--duration:20s] [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]"
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
    description:
      "A Human-Computer Interaction Design Approach through Speech Command for Google Chrome",
    className:
      "col-span-5 lg:col-span-1 bg-gradient-to-tr from-[#556D6B25] to-[#24999025]",
    href: "https://chromia.kabsu.me/",
    cta: "Learn more",
    background: (
      <Image
        alt="chromia-background-img"
        src="/thesis-pics/chromia-background.png"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover [--duration:20s] [mask-image:linear-gradient(to_top,transparent_20%,#000_100%)]"
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
    className:
      "col-span-5 lg:col-span-1 bg-gradient-to-tr from-[#55756125] to-[#23C45E25]",
    href: "https://eboto.app/",
    cta: "Learn more",
    background: (
      <Image
        alt="eboto-background-img"
        src="/thesis-pics/eboto-background.png"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover [--duration:20s] [mask-image:linear-gradient(to_top,transparent_20%,#000_100%)]"
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
    className:
      "col-span-5 lg:col-span-2 bg-gradient-to-tr from-[#55756125] to-[#23C45E25]",
    href: "https://odyssey.kabsu.me/",
    cta: "Learn more",
    background: (
      <Image
        alt="odyssey-background-img"
        src="/thesis-pics/odyssey-background.png"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover [--duration:20s] [mask-image:linear-gradient(to_top,transparent_20%,#000_100%)]"
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
    className:
      "col-span-5 lg:col-span-2 bg-gradient-to-tr from-[#784E7725] to-[#D300CB25]",
    href: "https://swardify.kabsu.me/",
    cta: "Learn more",
    background: (
      <Image
        alt="swardify-background-img"
        src="/thesis-pics/swardify-background.png"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover [--duration:20s] [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]"
      />
    ),
  },
];

export default function HomePublic({ error }: { error?: string }) {
  return (
    <div className="space-y-10 px-4">
      {/* NEW HERO SECTION */}
      <div className="relative h-screen w-full overflow-hidden">
        <Ripple />
        <nav className="relative z-50 flex w-full items-center justify-between border-b p-4">
          <div className="flex items-center gap-x-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={40}
              height={40}
              priority
              className="pointer-events-none mx-auto select-none"
            />
            <h1 className="text-center text-2xl font-bold">Kabsu.me</h1>
          </div>
          <div className="flex items-center gap-x-2">
            <Link href="https://github.com/bricesuazo/kabsu.me" target="_blank">
              <Button variant="outline" className="rounded-full">
                <Github size="1.25rem" />
              </Button>
            </Link>
            <ToggleTheme />
          </div>
        </nav>
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-y-8 lg:gap-y-12">
          <h1 className="text-balance text-center text-5xl font-semibold text-primary dark:text-white lg:text-7xl">
            Exclusive Social Hub for Cavite State University
          </h1>
          <h4 className="max-w-screen-md text-balance text-center lg:text-xl">
            A social media platform that&apos;s only exclusive for Cavite State
            University students, faculty, and alumni.
          </h4>

          <div className="flex flex-col gap-y-2">
            <div className="z-50 mx-auto">
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
              fallback={<Skeleton className="my-1 h-3 w-36 rounded-full" />}
            >
              <UsersLength />
            </Suspense>
          </div>
        </div>
        <p className="absolute bottom-0 mx-auto w-full text-balance py-8 text-center text-sm text-muted-foreground">
          This website is not affiliated with Cavite State University.
        </p>
      </div>

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

        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-[#121212]"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-[#121212]"></div>
      </div>

      <h1 className="text-center text-4xl font-bold text-primary">
        Partnerships
      </h1>

      <div className="">
        <BentoGrid className="grid grid-cols-5">
          {THESIS_INFO.map((thesis, i) => {
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
          We are a group of passionate Computer Science students at Cavite State
          University - Main Campus.
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
      {/* <div className="grid place-items-center space-y-8">
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
      </div> */}
      <Separator className="mx-auto w-8" />
      <Footer />
    </div>
  );
}

async function UsersLength() {
  const getTotalUsersQuery = await api.users.getTotalUsers.query();
  return (
    <p className="flex items-center justify-center gap-x-1 text-center text-sm text-muted-foreground">
      <NumberTicker value={getTotalUsersQuery + 2639} />
      Kabsuhenyos registered
    </p>
  );
}
