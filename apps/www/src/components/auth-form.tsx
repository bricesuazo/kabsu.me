"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Session } from "@cvsu.me/auth";

import { Icons } from "./icons";
import ProgramAuth from "./program-auth";
import { ToggleTheme } from "./toggle-theme";
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

export default function AuthForm({ session }: { session: Session }) {
  const { data } = api.users.getProgramForAuth.useQuery();
  const isUsernameExistsMutation = api.users.isUsernameExists.useMutation();
  const [page, setPage] = useState(0);

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
    name: z.string().nonempty({ message: "Display name is required." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: session.user.email.split("@")[0]?.replace(".", "-") ?? "",
      name: session.user.name ?? "",
    },
  });

  useEffect(() => {
    form.setValue(
      "username",
      session.user.email.split("@")[0]?.replace(".", "-") ?? "",
    );
    form.setValue("name", session.user.name ?? "");
  }, [form]);

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
          {session.user.email}
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
                  name="name"
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
}
