"use client";

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
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "./ui/form";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { College, Department, Program } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icons } from "./icons";

export default function ProgramAuth({
  // data,
  form1,
}: {
  form1: {
    username: string;
    first_name: string;
    last_name: string;
  };
  // data: {
  //   colleges: College[];
  //   departments: Department[];
  //   programs: Program[];
  // };
}) {
  const data: {
    colleges: College[];
    departments: Department[];
    programs: Program[];
  } = {
    colleges: [],
    departments: [],
    programs: [],
  };
  const { isLoaded, signUp, setActive } = useSignUp();
  const [opens, setOpens] = useState<{
    colleges: boolean;
    departments: boolean;
    programs: boolean;
  }>({
    colleges: false,
    departments: false,
    programs: false,
  });
  const form2Schema = z.object({
    college_id: z.string().nonempty(),
    department_id: z.string().nonempty(),
    program_id: z.string().nonempty(),
  });
  const form2 = useForm<z.infer<typeof form2Schema>>({
    resolver: zodResolver(form2Schema),
    defaultValues: {
      college_id: "",
      department_id: "",
      program_id: "",
    },
  });
  console.log("🚀 ~ file: program-auth.tsx:63 ~ form2:", form2.getValues());
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
                          .find((department) => department.id === field.value)
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
                              form2.setValue("department_id", department.id);
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
                            {department.name} ({department.slug.toUpperCase()})
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
          name="program_id"
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
