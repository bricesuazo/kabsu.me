"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
// import { useSearchParams } from "next/navigation";
// import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/client";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Github } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DEVS_INFO } from "@cvsu.me/constants";

import Footer from "./footer";
import { Icons } from "./icons";
import ProgramAuth from "./program-auth";
import { ToggleTheme } from "./toggle-theme";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

export default function AuthForm() {
  // const searchParams = useSearchParams();
  const { data } = api.users.getProgramForAuth.useQuery();
  const isUsernameExistsMutation = api.users.isUsernameExists.useMutation();
  const [page, setPage] = useState(0);
  const [isLoading] = useState(false);
  const { isLoaded: isLoadedSignIn, signIn } = useSignIn();
  const { isLoaded: isLoadedSignUp, signUp } = useSignUp();
  const getTotalUsersQuery = api.users.getTotalUsers.useQuery();

  const form1Schema = z.object({
    username: z
      .string()
      .min(4, { message: "Username must be at least 4 characters long." })
      .max(64, { message: "Username must be at most 64 characters long." })
      .regex(
        /^(?=[a-zA-Z0-9_-]+$)(?!.*[-_]{2})[a-zA-Z0-9]+([-_]?[a-zA-Z0-9]+)*$/,
        {
          message:
            "Username must only contain letters, numbers, underscores, and dashes.",
        },
      )
      .nonempty({ message: "Username is required." }),
    first_name: z.string().nonempty({ message: "First name is required." }),
    last_name: z.string().nonempty({ message: "Last name is required." }),
  });

  const form1 = useForm<z.infer<typeof form1Schema>>({
    resolver: zodResolver(form1Schema),
    defaultValues: {
      username: signUp?.emailAddress?.split("@")[0]?.replace(".", "-") ?? "",
      first_name: signUp?.firstName ?? "",
      last_name: signUp?.lastName ?? "",
    },
  });
  useEffect(() => {
    if (!signUp) return;

    if (!isLoadedSignUp) return;

    form1.setValue(
      "username",
      signUp.emailAddress?.split("@")[0]?.replace(".", "-") ?? "",
    );
    form1.setValue("first_name", signUp.firstName ?? "");
    form1.setValue("last_name", signUp.lastName ?? "");
  }, [signUp, isLoadedSignUp, form1]);

  if (signUp?.status === "missing_requirements") {
    return (
      <div className="space-y-8 py-20">
        <div className="">
          <div className="flex justify-center">
            <ToggleTheme />
          </div>
          <h1 className="text-center text-4xl font-bold">
            Welcome to <span className="text-primary">CvSU.me</span>
          </h1>
          <h4 className="text-center text-muted-foreground">
            Fill out the form below to continue.
          </h4>
          <p className="text-center text-sm text-muted-foreground">
            {signUp?.emailAddress}
          </p>
        </div>
        {page === 0 ? (
          <>
            <Form {...form1}>
              <form
                onSubmit={form1.handleSubmit(async (values) => {
                  const isUsernameExists =
                    await isUsernameExistsMutation.mutateAsync({
                      username: values.username,
                    });

                  if (isUsernameExists) {
                    form1.setError("username", {
                      type: "manual",
                      message: "Username is already taken.",
                    });
                    return;
                  }
                  setPage(1);
                })}
                className="space-y-8"
              >
                <FormField
                  control={form1.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="bricesuazo"
                          disabled={form1.formState.isSubmitting}
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value.toLowerCase());
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Must be unique and contain only letters, numbers, and
                        underscores.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-x-2">
                  <FormField
                    control={form1.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brice"
                            {...field}
                            disabled={form1.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          This is how your name will appear on your posts.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form1.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Suazo"
                            {...field}
                            disabled={form1.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          This is how your name will appear on your posts.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  variant="outline"
                  type="submit"
                  disabled={form1.formState.isSubmitting}
                >
                  {form1.formState.isSubmitting && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Next
                </Button>
              </form>
            </Form>
          </>
        ) : (
          data && (
            <ProgramAuth
              form1={form1.getValues()}
              data={data}
              page={page}
              setPage={setPage}
            />
          )
        )}
      </div>
    );
  } else {
    return (
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
            A social media platform that&apos;s only exclusive for Cavite State
            University students, faculty, and alumni.
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
            <Link href="https://github.com/bricesuazo/cvsu.me" target="_blank">
              <Badge variant="outline" className="h-8 text-sm">
                <Github size="1rem" className="mr-1" />
                Source Code
              </Badge>
            </Link>
          </div>
          <Button
            // variant="outline"
            // onClick={async () => {
            //   if (!isLoadedSignIn) return;
            //   setLoading(true);

            //   await signIn.authenticateWithRedirect({
            //     strategy: "oauth_google",
            //     redirectUrl: "/sso-callback",
            //     redirectUrlComplete: searchParams.get("callback_url")
            //       ? `/${searchParams.get("callback_url")}`
            //       : "/",
            //   });

            //   setLoading(false);
            // }}
            disabled={!isLoadedSignIn || isLoading || true}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Sign in with CvSU Account
          </Button>

          {/* <p className="text-sm">
            Sorry, we are currently under maintenance due to high traffic.
          </p> */}

          {signIn?.firstFactorVerification.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {signIn.firstFactorVerification.error.message}
              </AlertTitle>
              <AlertDescription>
                {signIn?.firstFactorVerification.error?.code ===
                  "not_allowed_access" && (
                  <>
                    Please use your CvSU account.
                    <br />
                  </>
                )}{" "}
                {signIn.firstFactorVerification.error.longMessage}
              </AlertDescription>
            </Alert>
          )}

          <ToggleTheme />

          {getTotalUsersQuery.isLoading ? (
            <Skeleton className="my-1 h-3 w-36 rounded-full" />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              {getTotalUsersQuery.data} users registered.
            </p>
          )}
        </div>
        {/* ABOUT DEV COMPONENT */}{" "}
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
}
