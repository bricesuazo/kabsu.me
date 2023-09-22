"use client";

import { Button } from "@/components/ui/button";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Icons } from "./icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { DEVS_INFO } from "@cvsu.me/constants";
import ProgramAuth from "./program-auth";
import Image from "next/image";
import { ToggleTheme } from "./toggle-theme";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Separator } from "./ui/separator";
import Footer from "./footer";
import { Badge } from "./ui/badge";
import { api } from "@/lib/trpc/client";

export default function AuthForm() {
  const searchParams = useSearchParams();
  const { data } = api.users.getProgramForAuth.useQuery();
  const isUsernameExistsMutation = api.users.isUsernameExists.useMutation();
  const [page, setPage] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const { isLoaded: isLoadedSignIn, signIn } = useSignIn();
  const { isLoaded: isLoadedSignUp, signUp } = useSignUp();

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
            src="/logo.png"
            alt="Logo"
            width={256}
            height={256}
            priority
            className="pointer-events-none mx-auto select-none"
          />

          <div className="flex justify-center">
            <Link href="https://github.com/bricesuazo/cvsu.me" target="_blank">
              <Badge>Beta Testing Phase</Badge>
            </Link>
          </div>
          <h1 className="text-center text-6xl font-bold text-primary">
            CvSU.me
          </h1>
          <h4 className="text-center text-xl [text-wrap:balance]">
            A social media platform that&apos;s only exclusive for Cavite State
            University students, faculty, and alumni.
          </h4>
        </div>
        <div className="flex flex-col items-center justify-center gap-y-4 ">
          <Button
            // variant="outline"
            onClick={async () => {
              if (!isLoadedSignIn) return;
              setLoading(true);

              await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: searchParams.get("callback_url")
                  ? `/${searchParams.get("callback_url")}`
                  : "/",
              });

              setLoading(false);
            }}
            disabled={!isLoadedSignIn || isLoading}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Sign in with CvSU Account
          </Button>

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
        </div>
        {/* ABOUT DEV COMPONENT */}{" "}
        <div>
          <p className="py-4 text-center text-4xl font-bold text-primary">
            About
          </p>
          <div className="mx-auto grid w-fit grid-cols-1 gap-x-20 self-center sm:grid-cols-2">
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