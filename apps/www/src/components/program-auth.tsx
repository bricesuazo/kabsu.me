"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Album,
  Briefcase,
  Check,
  ChevronsUpDown,
  GraduationCap,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ACCOUNT_TYPE } from "@cvsu.me/db/schema";
import type { Campus, College, Program } from "@cvsu.me/db/schema";

import { Icons } from "./icons";
import { Button } from "./ui/button";
import { Card, CardFooter, CardHeader } from "./ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

export default function ProgramAuth({
  form1,
  data,
  page,
  setPage,
}: {
  form1: {
    username: string;
    first_name: string;
    last_name: string;
  };
  data: {
    campuses: Campus[];
    colleges: College[];
    programs: Program[];
  };
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const signUpMutation = api.users.signUp.useMutation();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [opens, setOpens] = useState<{
    campuses: boolean;
    colleges: boolean;
    programs: boolean;
  }>({
    campuses: false,
    colleges: false,
    programs: false,
  });
  const form2Schema = z.object({
    type: z.enum(ACCOUNT_TYPE, {
      required_error: "Role is required.",
    }),
    campus_id: z
      .string({
        required_error: "Campus is required.",
      })
      .nonempty({
        message: "Campus is required.",
      }),
    college_id: z
      .string({
        required_error: "College is required.",
      })
      .nonempty({
        message: "College is required.",
      }),
    program_id: z.string().nonempty({
      message: "Program is required.",
    }),
  });
  const form2 = useForm<z.infer<typeof form2Schema>>({
    resolver: zodResolver(form2Schema),
    defaultValues: {
      campus_id: "",
      college_id: "",
      program_id: "",
    },
  });

  if (!data) return null;

  return (
    <>
      <Form {...form2}>
        <form
          onSubmit={form2.handleSubmit(async (values) => {
            if (!isLoaded) return;

            const new_user = await signUp.update({
              username: form1.username,
              firstName: form1.first_name,
              lastName: form1.last_name,
              redirectUrl: "/",
              actionCompleteRedirectUrl: "/",
            });

            await signUpMutation.mutateAsync({
              userId: new_user.createdUserId ?? "",
              program_id: values.program_id,
              type: values.type ?? "",
            });

            await setActive({
              session: signUp.createdSessionId ?? "",
            });
          })}
          className="space-y-8"
        >
          <FormField
            control={form2.control}
            name="type"
            disabled={!form2.getValues("type")}
            render={({ field }) => (
              <FormItem>
                <h2 className="text-center text-xl font-semibold">
                  What&apos;s your role in CvSU?
                </h2>
                <FormControl>
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    {ACCOUNT_TYPE.map((type) => (
                      <button
                        key={type}
                        onClick={async () => {
                          form2.setValue("type", type);
                          await form2.trigger("type");
                        }}
                        className="w-full flex-1"
                        type="button"
                        disabled={form2.formState.isSubmitting}
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
              control={form2.control}
              name="campus_id"
              disabled={!form2.getValues("type")}
              render={({ field }) => (
                <FormItem className="flex w-full flex-1 flex-col">
                  <FormLabel>Campus</FormLabel>
                  <FormControl>
                    <Popover
                      open={opens.campuses}
                      onOpenChange={(open) =>
                        setOpens((prev) => ({ ...prev, campuses: open }))
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={opens.campuses}
                          className={cn(
                            "flex-1 justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={form2.formState.isSubmitting}
                        >
                          {field.value
                            ? data.campuses
                                .find((campus) => campus.id === field.value)
                                ?.slug.toUpperCase()
                            : "Select campus"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[236px] p-0" side="bottom">
                        <Command
                          filter={(value, search) => {
                            if (value.match(search)) return 1;
                            return 0;
                          }}
                        >
                          <CommandInput placeholder="Search campus..." />
                          <CommandEmpty>No campus.</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-80">
                              {data.campuses.map((campus) => (
                                <CommandItem
                                  key={campus.id}
                                  value={`${
                                    campus.name
                                  } (${campus.slug.toUpperCase()})`}
                                  onSelect={async () => {
                                    if (
                                      form2.getValues("campus_id") !== campus.id
                                    ) {
                                      form2.setValue("college_id", "");
                                      form2.setValue("program_id", "");
                                    }

                                    form2.setValue("campus_id", campus.id);
                                    await form2.trigger("campus_id");
                                    setOpens((prev) => ({
                                      ...prev,
                                      campuses: false,
                                    }));
                                  }}
                                  className="line-clamp-1"
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
                                  {campus.name} ({campus.slug.toUpperCase()})
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form2.control}
              name="college_id"
              render={({ field }) => (
                <FormItem className="flex w-full flex-1 flex-col">
                  <FormLabel>College</FormLabel>
                  <FormControl>
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
                            "flex-1 justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={
                            form2.formState.isSubmitting ||
                            !form2.getValues("campus_id")
                          }
                        >
                          {field.value
                            ? data.colleges
                                .find((college) => college.id === field.value)
                                ?.slug.toUpperCase()
                            : "Select college"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[236px] p-0" side="bottom">
                        <Command
                          filter={(value, search) => {
                            if (value.match(search)) return 1;
                            return 0;
                          }}
                        >
                          <CommandInput placeholder="Search college..." />
                          <CommandEmpty>No college.</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-80">
                              {data.colleges
                                .filter(
                                  (college) =>
                                    college.campus_id ===
                                    form2.getValues("campus_id"),
                                )
                                .map((college) => (
                                  <CommandItem
                                    key={college.id}
                                    value={`${
                                      college.name
                                    } (${college.slug.toUpperCase()})`}
                                    onSelect={async () => {
                                      if (
                                        form2.getValues("college_id") !==
                                        college.id
                                      ) {
                                        form2.setValue("program_id", "");
                                      }

                                      form2.setValue("college_id", college.id);
                                      await form2.trigger("college_id");
                                      setOpens((prev) => ({
                                        ...prev,
                                        colleges: false,
                                      }));
                                    }}
                                    className="line-clamp-1"
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
                                    {college.name} ({college.slug.toUpperCase()}
                                    )
                                  </CommandItem>
                                ))}
                            </ScrollArea>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form2.control}
              name="program_id"
              render={({ field }) => (
                <FormItem className="flex w-full flex-1 flex-col">
                  <FormLabel>Program</FormLabel>
                  <FormControl>
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
                          className="justify-between"
                          disabled={
                            !form2.getValues("college_id") ||
                            form2.formState.isSubmitting
                          }
                        >
                          {field.value
                            ? data.programs
                                .find((program) => program.id === field.value)
                                ?.slug.toUpperCase()
                            : "Select program..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[236px] p-0" side="bottom">
                        <Command
                          filter={(value, search) => {
                            if (value.match(search)) return 1;
                            return 0;
                          }}
                        >
                          <CommandInput placeholder="Search program..." />
                          <CommandEmpty>No program.</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-80">
                              {data.programs
                                .filter(
                                  (program) =>
                                    program.college_id ===
                                    form2.getValues("college_id"),
                                )
                                .map((program) => (
                                  <CommandItem
                                    key={program.id}
                                    value={`${
                                      program.name
                                    } (${program.slug.toUpperCase()})`}
                                    onSelect={async () => {
                                      form2.setValue("program_id", program.id);
                                      await form2.trigger("program_id");
                                      setOpens((prev) => ({
                                        ...prev,
                                        programs: false,
                                      }));
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
                                    {program.name} ({program.slug.toUpperCase()}
                                    )
                                  </CommandItem>
                                ))}
                            </ScrollArea>
                          </CommandGroup>
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
            {page !== 0 && (
              <Button
                variant="outline"
                onClick={() => setPage((prev) => prev - 1)}
                disabled={form2.formState.isSubmitting}
              >
                Back
              </Button>
            )}
            <Button type="submit" disabled={form2.formState.isSubmitting}>
              {form2.formState.isSubmitting && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign up
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
