"use client";

import { Button } from "@/components/ui/button";
import { clerkClient, useSignIn, useSignUp } from "@clerk/nextjs";
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { cn } from "@/lib/utils";
import { addProgramToUserMetadata } from "@/actions/user";

export default function AuthForm({
  data,
}: {
  data: {
    colleges: College[];
    departments: Department[];
    programs: Program[];
  };
}) {
  console.log("🚀 ~ file: auth-form.tsx:41 ~ data:", data);
  const [page, setPage] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const { isLoaded: isLoadedSignIn, signIn } = useSignIn();
  const { isLoaded: isLoadedSignUp, signUp, setActive } = useSignUp();

  const [opens, setOpens] = useState<{
    colleges: boolean;
    departments: boolean;
    programs: boolean;
  }>({
    colleges: false,
    departments: false,
    programs: false,
  });

  const form1Schema = z.object({
    username: z.string().nonempty(),
    first_name: z.string().nonempty(),
    last_name: z.string().nonempty(),
  });

  const form2Schema = z.object({
    college_id: z.string().nonempty(),
    department_id: z.string().nonempty(),
    program_id: z.string().nonempty(),
  });

  const form1 = useForm<z.infer<typeof form1Schema>>({
    resolver: zodResolver(form1Schema),
    defaultValues: {
      username: "",
      first_name: signUp?.firstName ?? "",
      last_name: signUp?.lastName ?? "",
    },
  });
  const form2 = useForm<z.infer<typeof form2Schema>>({
    resolver: zodResolver(form2Schema),
    defaultValues: {
      college_id: undefined,
      department_id: undefined,
      program_id: undefined,
    },
  });
  console.log("🚀 ~ file: auth-form.tsx:76 ~ form1:", form1.getValues());
  console.log("🚀 ~ file: auth-form.tsx:85 ~ form2:", form2.getValues());

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
      return (
        <Form {...form2}>
          <form
            onSubmit={form2.handleSubmit(async (values) => {
              const new_user = await signUp.update({
                username: form1.getValues("username"),
                firstName: form1.getValues("first_name"),
                lastName: form1.getValues("last_name"),
                redirectUrl: "/",
                actionCompleteRedirectUrl: "/",
              });

              await addProgramToUserMetadata({
                userId: new_user.createdUserId ?? "",
                program_id: values.program_id,
              });

              setActive({
                session: signUp.createdSessionId ?? "",
              });
            })}
            className="space-y-8"
          >
            <FormField
              control={form2.control}
              name="college_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover
                    open={opens.colleges}
                    onOpenChange={(open) =>
                      setOpens((prev) => ({ ...prev, colleges: open }))
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={opens.colleges}
                        className={cn(
                          "w-[200px] justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? data.colleges
                              .find((college) => college.id === field.value)
                              ?.slug.toUpperCase()
                          : "Select college"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search college..." />
                        <CommandEmpty>No college.</CommandEmpty>
                        <CommandGroup>
                          {data.colleges.map((college) => (
                            <CommandItem
                              key={college.id}
                              value={`${
                                college.name
                              } (${college.slug.toUpperCase()})`}
                              onSelect={() => {
                                form2.setValue("college_id", college.id);
                                setOpens((prev) => ({
                                  ...prev,
                                  colleges: false,
                                }));
                              }}
                              className="line-clamp-1"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  college.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {college.name} ({college.slug.toUpperCase()})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This is how your name will appear on your posts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form2.control}
              name="department_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover
                    open={opens.departments}
                    onOpenChange={(open) =>
                      setOpens((prev) => ({ ...prev, departments: open }))
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={opens.departments}
                        className="w-[200px] justify-between"
                        disabled={!form2.getValues("college_id")}
                      >
                        {field.value
                          ? data.departments
                              .find(
                                (department) => department.id === field.value,
                              )
                              ?.slug.toUpperCase()
                          : "Select department..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search department..." />
                        <CommandEmpty>No department.</CommandEmpty>
                        <CommandGroup>
                          {data.departments
                            .filter(
                              (department) =>
                                department.college_id ===
                                form2.getValues("college_id"),
                            )
                            .map((department) => (
                              <CommandItem
                                key={department.id}
                                value={`${
                                  department.name
                                } (${department.slug.toUpperCase()})`}
                                onSelect={() => {
                                  form2.setValue(
                                    "department_id",
                                    department.id,
                                  );
                                  setOpens((prev) => ({
                                    ...prev,
                                    departments: false,
                                  }));
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === department.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {department.name} (
                                {department.slug.toUpperCase()})
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This is how your name will appear on your posts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form2.control}
              name="department_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover
                    open={opens.programs}
                    onOpenChange={(open) =>
                      setOpens((prev) => ({ ...prev, programs: open }))
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={opens.programs}
                        className="w-[200px] justify-between"
                        disabled={!form2.getValues("department_id")}
                      >
                        {field.value
                          ? data.programs
                              .find((program) => program.id === field.value)
                              ?.slug.toUpperCase()
                          : "Select program..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search program..." />
                        <CommandEmpty>No program.</CommandEmpty>
                        <CommandGroup>
                          {data.programs
                            .filter(
                              (program) =>
                                program.department_id ===
                                form2.getValues("department_id"),
                            )
                            .map((program) => (
                              <CommandItem
                                key={program.id}
                                value={`${
                                  program.name
                                } (${program.slug.toUpperCase()})`}
                                onSelect={() => {
                                  form2.setValue("program_id", program.id);
                                  setOpens((prev) => ({
                                    ...prev,
                                    programs: false,
                                  }));
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === program.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {program.name} ({program.slug.toUpperCase()})
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This is how your name will appear on your posts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              variant="outline"
              type="submit"
              disabled={form2.formState.isSubmitting}
            >
              {form2.formState.isSubmitting && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign up
            </Button>
          </form>
        </Form>
      );
    }
  }
}
