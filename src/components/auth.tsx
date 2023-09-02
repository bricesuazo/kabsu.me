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

export default function Auth() {
  const [isLoading, setLoading] = useState(false);
  const { isLoaded: isLoadedSignIn, signIn } = useSignIn();
  const { isLoaded: isLoadedSignUp, signUp, setActive } = useSignUp();

  const formSchema = z.object({
    username: z.string().nonempty(),
    first_name: z.string().nonempty(),
    last_name: z.string().nonempty(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

    form.setValue("first_name", signUp.firstName ?? "");
    form.setValue("last_name", signUp.lastName ?? "");
  }, [signUp, isLoadedSignUp, form]);

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
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await signUp.update({
              username: values.username,
              firstName: values.first_name,
              lastName: values.last_name,
              redirectUrl: "/",
              actionCompleteRedirectUrl: "/",
            });

            setActive({
              session: signUp.createdSessionId ?? "",
            });
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

          <div className="flex  items-center gap-x-2">
            <FormField
              control={form.control}
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
              control={form.control}
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

          <Button
            variant="outline"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign up
          </Button>
        </form>
      </Form>
    );
  }
}
