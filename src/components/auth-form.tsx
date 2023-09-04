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
import { College, Department, Program } from "@/db/schema";

import ProgramAuth from "./program-auth";
import Image from "next/image";
import { ToggleTheme } from "./toggle-theme";

export default function AuthForm(
  {
    //   data,
    // }: {
    //   data: {
    //     colleges: College[];
    //     departments: Department[];
    //     programs: Program[];
    //   };
  },
) {
  const [page, setPage] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const { isLoaded: isLoadedSignIn, signIn } = useSignIn();
  const { isLoaded: isLoadedSignUp, signUp } = useSignUp();

  const form1Schema = z.object({
    username: z.string().nonempty(),
    first_name: z.string().nonempty(),
    last_name: z.string().nonempty(),
  });

  const form1 = useForm<z.infer<typeof form1Schema>>({
    resolver: zodResolver(form1Schema),
    defaultValues: {
      username: "",
      first_name: signUp?.firstName ?? "",
      last_name: signUp?.lastName ?? "",
    },
  });

  useEffect(() => {
    if (!signUp) return;

    if (signUp.status !== "missing_requirements") return;

    if (!isLoadedSignUp) return;

    form1.setValue("first_name", signUp.firstName ?? "");
    form1.setValue("last_name", signUp.lastName ?? "");
  }, [signUp, isLoadedSignUp, form1]);

  if (signUp?.status === "missing_requirements") {
    if (page === 0) {
      return (
        <Form {...form1}>
          <form
            onSubmit={form1.handleSubmit(() => {
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
                    <Input placeholder="bricesuazo" {...field} />
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
                      <Input placeholder="Brice" {...field} />
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
                      <Input placeholder="Suazo" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how your name will appear on your posts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button variant="outline" type="submit">
              Next
            </Button>
          </form>
        </Form>
      );
    } else {
      return (
        <ProgramAuth
          // data={data}
          form1={form1.getValues()}
        />
      );
    }
  } else {
    return (
      <div className="space-y-20 py-20">
        <div className="space-y-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={256}
            height={256}
            className="pointer-events-none mx-auto select-none"
          />

          <h1 className="text-center text-6xl font-bold text-primary">
            CvSU.me
          </h1>
          <h4 className="text-center text-xl [text-wrap:balance]">
            A social media platform for CvSU students, faculty, and alumni.
          </h4>
        </div>

        <div className="flex flex-col items-center justify-center gap-y-4">
          <Button
            // variant="outline"
            onClick={async () => {
              if (!isLoadedSignIn) return;
              setLoading(true);

              await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/",
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
          <ToggleTheme />
        </div>
      </div>
    );
  }
}
