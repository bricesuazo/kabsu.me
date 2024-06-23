"use client";

import type { Session } from "@supabase/supabase-js";
import type { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Album,
  Briefcase,
  Check,
  ChevronsUpDown,
  GraduationCap,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { Database } from "../../../../supabase/types";
import { Button } from "~/components/ui/button";
import { api } from "~/lib/trpc/client";
import { cn } from "~/lib/utils";
import { createClient } from "~/supabase/client";
import { Icons } from "./icons";
import { ToggleTheme } from "./toggle-theme";
import { Card, CardFooter, CardHeader } from "./ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
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
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

const formSchema = z.object({
  page: z.number(),
  name: z.string().min(1, { message: "Display name is required." }),
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
    .min(1, { message: "Username is required." }),
  type: z.custom<Database["public"]["Enums"]["user_type"]>().optional(),
  campus_id: z
    .string({
      required_error: "Campus is required.",
    })
    .min(1, {
      message: "Campus is required.",
    })
    .optional(),
  college_id: z
    .string({
      required_error: "College is required.",
    })
    .min(1, {
      message: "College is required.",
    })
    .optional(),
  program_id: z
    .string()
    .min(1, {
      message: "Program is required.",
    })
    .optional(),
});

export default function OnboardingForm({ session }: { session: Session }) {
  const router = useRouter();
  const isUsernameExistsMutation = api.users.isUsernameExists.useMutation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const signUpMutation = api.users.signUp.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsRedirecting(true);
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      page: 0,
      username: session.user.email?.split("@")[0]?.replace(".", "-") ?? "",
    },
  });

  useEffect(() => {
    form.setValue(
      "username",
      session.user.email?.split("@")[0]?.replace(".", "-") ?? "",
    );
    form.setValue("name", "");
  }, [form, session.user.email]);

  const [signoutLoading, setSignoutLoading] = useState(false);

  return (
    <div className="space-y-8 py-20">
      <div className="">
        <div className="flex justify-center">
          <ToggleTheme />
        </div>
        <h1 className="text-center text-4xl font-bold">
          Welcome to <span className="text-primary">Kabsu.me</span>
        </h1>
        <h4 className="text-center text-muted-foreground">
          Fill out the form below to continue.
        </h4>
        <p className="text-center text-sm text-muted-foreground">
          {session.user.email}
        </p>

        <div className="flex justify-center">
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            disabled={signoutLoading}
            onClick={async () => {
              setSignoutLoading(true);
              const supabase = createClient();
              await supabase.auth.signOut();

              router.refresh();
            }}
          >
            {signoutLoading && (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            )}
            Sign out
          </Button>
        </div>
      </div>
      {form.getValues("page") === 0 ? (
        <Page0
          form={form}
          onSubmit={form.handleSubmit(async (values) => {
            if (values.page !== 0) return;

            const isUsernameExists = await isUsernameExistsMutation.mutateAsync(
              { username: values.username },
            );

            if (isUsernameExists) {
              form.setError("username", {
                type: "manual",
                message: "Username is already taken.",
              });
              return;
            }
            form.setValue("page", 1);
          })}
        />
      ) : form.getValues("page") === 1 ? (
        <Page1
          form={form}
          onSubmit={form.handleSubmit(async (values) => {
            if (!values.program_id || !values.type) return;

            await signUpMutation.mutateAsync({
              program_id: values.program_id,
              type: values.type,
              name: values.name,
              username: values.username,
            });
          })}
          isRedirecting={isRedirecting}
        />
      ) : null}
    </div>
  );
}

function Page0({
  form,
  onSubmit,
}: {
  form: UseFormReturn<
    {
      name: string;
      page: number;
      username: string;
      campus_id?: string | undefined;
      type?: "student" | "faculty" | "alumni" | undefined;
      college_id?: string | undefined;
      program_id?: string | undefined;
    },
    unknown,
    undefined
  >;
  onSubmit: () => void;
}) {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
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
  );
}

function Page1({
  form,
  onSubmit,
  isRedirecting,
}: {
  form: UseFormReturn<
    {
      name: string;
      page: number;
      username: string;
      campus_id?: string | undefined;
      type?: "student" | "faculty" | "alumni" | undefined;
      college_id?: string | undefined;
      program_id?: string | undefined;
    },
    unknown,
    undefined
  >;
  onSubmit: () => void;
  isRedirecting: boolean;
}) {
  const { data } = api.users.getProgramForAuth.useQuery(undefined, {
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <h2 className="text-center text-xl font-semibold">
                  What&apos;s your role in CvSU?
                </h2>
                <FormControl>
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    {(
                      [
                        "student",
                        "faculty",
                        "alumni",
                      ] as Database["public"]["Enums"]["user_type"][]
                    ).map((type) => (
                      <button
                        key={type}
                        onClick={async () => {
                          form.setValue("type", type);
                          await form.trigger("type");
                        }}
                        className="w-full flex-1"
                        type="button"
                        disabled={form.formState.isSubmitting}
                      >
                        <Card
                          className={cn(
                            field.value === type && "border-primary",
                          )}
                        >
                          <CardHeader className="items-center">
                            {(() => {
                              switch (type) {
                                case "student":
                                  return (
                                    <Album
                                      className={cn(
                                        "h-10 w-10",
                                        field.value === type && "text-primary",
                                      )}
                                    />
                                  );
                                case "faculty":
                                  return (
                                    <Briefcase
                                      className={cn(
                                        "h-10 w-10",
                                        field.value === type && "text-primary",
                                      )}
                                    />
                                  );
                                case "alumni":
                                  return (
                                    <GraduationCap
                                      className={cn(
                                        "h-10 w-10",
                                        field.value === type && "text-primary",
                                      )}
                                    />
                                  );
                                default:
                                  return null;
                              }
                            })()}
                          </CardHeader>

                          <CardFooter className="justify-center">
                            <Label htmlFor={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Label>
                          </CardFooter>
                        </Card>
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <FormField
              control={form.control}
              name="campus_id"
              render={({ field }) => (
                <FormItem className="flex w-full flex-1 flex-col">
                  <FormLabel>Campus</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "flex-1 justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={form.formState.isSubmitting || !data}
                        >
                          {data && field.value
                            ? data.campuses
                                .find((campus) => campus.id === field.value)
                                ?.slug.toUpperCase()
                            : "Select campus"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[236px] p-0" side="bottom">
                        <Command
                          filter={(value, search) =>
                            value.toLowerCase().includes(search.toLowerCase())
                              ? 1
                              : 0
                          }
                        >
                          <CommandInput placeholder="Search campus..." />
                          <CommandList>
                            <CommandEmpty>No campus.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-80">
                                {data?.campuses.map((campus) => (
                                  <CommandItem
                                    key={campus.id}
                                    value={`${
                                      campus.name
                                    } (${campus.slug.toUpperCase()})`}
                                    onSelect={() => {
                                      if (
                                        form.getValues("campus_id") !==
                                        campus.id
                                      ) {
                                        form.setValue("college_id", "");
                                        form.setValue("program_id", "");
                                      }

                                      form.setValue("campus_id", campus.id);
                                    }}
                                  >
                                    <div>
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          campus.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                    </div>
                                    <span>
                                      {campus.name} ({campus.slug.toUpperCase()}
                                      )
                                    </span>
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="college_id"
              render={({ field }) => (
                <FormItem className="flex w-full flex-1 flex-col">
                  <FormLabel>College</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="justify-between"
                          disabled={
                            form.formState.isSubmitting ||
                            form.getValues("campus_id") === undefined ||
                            !data
                          }
                        >
                          {data && field.value
                            ? data.colleges
                                .find((college) => college.id === field.value)
                                ?.slug.toUpperCase()
                            : "Select college"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[236px] p-0" side="bottom">
                        <Command
                          filter={(value, search) =>
                            value.toLowerCase().includes(search.toLowerCase())
                              ? 1
                              : 0
                          }
                        >
                          <CommandInput placeholder="Search college..." />
                          <CommandList>
                            <CommandEmpty>No college.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-80">
                                {data?.colleges
                                  .filter(
                                    (college) =>
                                      college.campus_id ===
                                      form.getValues("campus_id"),
                                  )
                                  .map((college) => (
                                    <CommandItem
                                      key={college.id}
                                      value={`${
                                        college.name
                                      } (${college.slug.toUpperCase()})`}
                                      onSelect={async () => {
                                        if (
                                          form.getValues("college_id") !==
                                          college.id
                                        ) {
                                          form.setValue("program_id", "");
                                        }

                                        form.setValue("college_id", college.id);
                                        await form.trigger("college_id");
                                      }}
                                    >
                                      <div>
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            college.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                      </div>
                                      <span>
                                        {college.name} (
                                        {college.slug.toUpperCase()})
                                      </span>
                                    </CommandItem>
                                  ))}
                              </ScrollArea>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="program_id"
              render={({ field }) => (
                <FormItem className="flex w-full flex-1 flex-col">
                  <FormLabel>Program</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="justify-between"
                          disabled={
                            !form.getValues("college_id") ||
                            form.formState.isSubmitting ||
                            !data
                          }
                        >
                          {data && field.value
                            ? data.programs
                                .find((program) => program.id === field.value)
                                ?.slug.toUpperCase()
                            : "Select program..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[236px] p-0" side="bottom">
                        <Command
                          filter={(value, search) =>
                            value.toLowerCase().includes(search.toLowerCase())
                              ? 1
                              : 0
                          }
                        >
                          <CommandInput placeholder="Search program..." />
                          <CommandList>
                            <CommandEmpty>No program.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-80">
                                {data?.programs
                                  .filter(
                                    (program) =>
                                      program.college_id ===
                                      form.getValues("college_id"),
                                  )
                                  .map((program) => (
                                    <CommandItem
                                      key={program.id}
                                      value={`${
                                        program.name
                                      } (${program.slug.toUpperCase()})`}
                                      onSelect={async () => {
                                        form.setValue("program_id", program.id);
                                        await form.trigger("program_id");
                                      }}
                                    >
                                      <div>
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === program.id
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                      </div>
                                      <span>
                                        {program.name} (
                                        {program.slug.toUpperCase()})
                                      </span>
                                    </CommandItem>
                                  ))}
                              </ScrollArea>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                form.setValue("page", 0);
                await form.trigger("page");
              }}
              disabled={form.formState.isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                !form.getValues("program_id") ||
                !form.getValues("type") ||
                isRedirecting
              }
            >
              {form.formState.isSubmitting && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isRedirecting ? "Redirecting..." : "Sign up"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
