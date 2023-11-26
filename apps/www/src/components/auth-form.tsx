"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/client";
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
  const searchParams = useSearchParams();
  const getCurrentSessionQuery = api.auth.getCurrentSession.useQuery();
  const getTotalUsersQuery = api.users.getTotalUsers.useQuery();
  const isUsernameExistsMutation = api.users.isUsernameExists.useMutation();
  const { data } = api.users.getProgramForAuth.useQuery();
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
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
    display_name: z.string().nonempty({ message: "Display name is required." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username:
        getCurrentSessionQuery.data?.user.email
          .split("@")[0]
          ?.replace(".", "-") ?? "",
      display_name: getCurrentSessionQuery.data?.user.name ?? "",
    },
  });

  useEffect(() => {
    if (!getCurrentSessionQuery.data || getCurrentSessionQuery.isLoading)
      return;

    form.setValue(
      "username",
      getCurrentSessionQuery.data.user.email.split("@")[0]?.replace(".", "-") ??
        "",
    );
    form.setValue("display_name", getCurrentSessionQuery.data.user.name ?? "");
  }, [form]);

  if (searchParams.has("missing_info")) {
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
            {getCurrentSessionQuery.data?.user.email}
          </p>
        </div>
        {page === 0 ? (
          <>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(async (values) => {
                  const isUsernameExists =
                    await isUsernameExistsMutation.mutateAsync({
                      username: values.username,
                    });

                  if (isUsernameExists) {
                    form.setError("username", {
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
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="bricesuazo"
                          disabled={form.formState.isSubmitting}
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
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Display name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brice Suazo"
                            {...field}
                            disabled={form.formState.isSubmitting}
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
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
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
              form={form.getValues()}
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

          <form
            action={async () => {
              setIsLoading(true);
              await signIn("google", {
                redirect: true,
                redirectTo: searchParams.has("callback_url")
                  ? `/${searchParams.get("callback_url")}`
                  : "/",
              });
              setIsLoading(false);
            }}
          >
            <Button disabled={isLoading}>
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4" />
              )}
              Sign in with CvSU Account
            </Button>
          </form>

          {searchParams.has("error") ||
            (searchParams.has("error_description") && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{searchParams.get("error") ?? "Error"}</AlertTitle>
                <AlertDescription>
                  {searchParams.get("error_description") ??
                    "Something went wrong."}
                </AlertDescription>
              </Alert>
            ))}

          <ToggleTheme />

          {getTotalUsersQuery.isLoading ? (
            <Skeleton className="my-1 h-3 w-36 rounded-full" />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              {getTotalUsersQuery.data}
            </p>
          )}
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
