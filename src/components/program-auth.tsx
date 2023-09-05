"use client";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Album,
  Briefcase,
  Check,
  ChevronsUpDown,
  GraduationCap,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { cn } from "@/lib/utils";
import { addProgramToUserMetadata, getProgramForAuth } from "@/actions/user";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icons } from "./icons";
import { ACCOUNT_TYPE, College, Program } from "@/db/schema";
import { Card, CardFooter, CardHeader } from "./ui/card";
import { Label } from "./ui/label";

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
    colleges: College[];
    programs: Program[];
  };
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [opens, setOpens] = useState<{
    colleges: boolean;
    programs: boolean;
  }>({
    colleges: false,
    programs: false,
  });
  const form2Schema = z.object({
    type: z.enum(ACCOUNT_TYPE, {
      required_error: "Account type is required.",
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
      college_id: "",
      program_id: "",
    },
  });

  if (!data) return null;

  return (
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

          await addProgramToUserMetadata({
            userId: new_user.createdUserId ?? "",
            program_id: values.program_id,
            type: values.type ?? "",
          });

          setActive({
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
              <FormControl>
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  {ACCOUNT_TYPE.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        form2.setValue("type", type);
                      }}
                      className="w-full flex-1"
                      type="button"
                    >
                      <Card
                        className={cn(field.value === type && "border-primary")}
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
              <FormDescription>What&apos;s your role in CvSU?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <FormField
            control={form2.control}
            name="college_id"
            disabled={!form2.getValues("type")}
            render={({ field }) => (
              <FormItem className="flex w-full flex-1 flex-col">
                <FormLabel>College</FormLabel>
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
                      disabled={!form2.getValues("college_id")}
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
                              program.college_id ===
                              form2.getValues("college_id"),
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
  );
}
