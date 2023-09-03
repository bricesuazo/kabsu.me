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

export default function AuthForm({
  data,
}: {
  data: {
    colleges: College[];
    departments: Department[];
    programs: Program[];
  };
}) {
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

  if ((!signIn && !isLoadedSignIn) || (!signUp && !isLoadedSignUp))
    return <Icons.spinner className="animate-spin" />;

  if (!signIn.status) {
    return (
      <Button
        variant="outline"
        onClick={async () => {
          setLoading(true);

          await signIn.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: "/sso-callback",
            redirectUrlComplete: "/",
          });
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
    );
  } else if (signUp.status === "missing_requirements") {
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
      return <ProgramAuth data={data} form1={form1.getValues()} />;
    }
  }
}
