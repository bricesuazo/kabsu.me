"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, format, isAfter } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";

import type { Database } from "../../../../../../../supabase/types";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { api } from "~/lib/trpc/client";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  type: z.custom<Database["public"]["Enums"]["user_type"]>(),
  campus_id: z
    .string({
      required_error: "Campus is required.",
    })
    .min(1, {
      message: "Campus is required.",
    }),
  college_id: z
    .string({
      required_error: "College is required.",
    })
    .min(1, {
      message: "College is required.",
    }),
  program_id: z.string().min(1, {
    message: "Program is required.",
  }),
});

export default function TypePrograms({
  currentUserTypeProgram,
}: {
  currentUserTypeProgram: RouterOutputs["users"]["getCurrentUserTypeProgram"];
}) {
  const currentUserTypeProgramQuery =
    api.users.getCurrentUserTypeProgram.useQuery(undefined, {
      initialData: currentUserTypeProgram,
      refetchOnWindowFocus: true,
    });
  const changeCurrentUserTypeProgramMutation =
    api.users.changeCurrentUserTypeProgram.useMutation();
  const { data } = api.users.getProgramForAuth.useQuery(undefined, {
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });
  const [opens, setOpens] = useState({
    campus: false,
    college: false,
    program: false,
  });

  const is_disabled =
    currentUserTypeProgramQuery.data.program_changed_at !== null &&
    !isAfter(
      new Date(),
      addMonths(
        new Date(currentUserTypeProgramQuery.data.program_changed_at),
        3,
      ),
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: currentUserTypeProgramQuery.data.type,
      program_id: currentUserTypeProgramQuery.data.program_id,
    },
  });

  useEffect(() => {
    if (data) {
      const college_id = data.programs.find(
        (program) => program.id === currentUserTypeProgramQuery.data.program_id,
      )?.college_id;

      if (college_id) {
        form.resetField("college_id", { defaultValue: college_id });
      }

      const campus_id = data.colleges.find(
        (college) => college.id === college_id,
      )?.campus_id;

      if (campus_id) {
        form.resetField("campus_id", { defaultValue: campus_id });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await changeCurrentUserTypeProgramMutation.mutateAsync({
            type: values.type,
            program_id: values.program_id,
          });

          await currentUserTypeProgramQuery.refetch();
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <Label>Role</Label>
              <FormControl>
                <div className="flex items-center gap-4">
                  {(
                    [
                      { type: "student" },
                      { type: "alumni" },
                      { type: "faculty" },
                    ] as {
                      Icon: LucideIcon;
                      type: Database["public"]["Enums"]["user_type"];
                    }[]
                  ).map(({ type }) => (
                    <button
                      key={type}
                      onClick={async () => {
                        form.setValue("type", type);
                        await form.trigger("type");
                      }}
                      className="w-full flex-1 disabled:cursor-not-allowed"
                      type="button"
                      disabled={form.formState.isSubmitting || is_disabled}
                    >
                      <Card
                        className={cn(field.value === type && "border-primary")}
                      >
                        <CardHeader className="items-center">
                          <p>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
                        </CardHeader>
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
                  <Popover
                    open={opens.campus}
                    onOpenChange={(open) =>
                      setOpens((prev) => ({ ...prev, campus: open }))
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "flex-1 justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={
                          form.formState.isSubmitting || !data || is_disabled
                        }
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
                                      form.getValues("campus_id") !== campus.id
                                    ) {
                                      form.setValue("college_id", "");
                                      form.setValue("program_id", "");
                                    }

                                    form.setValue("campus_id", campus.id);
                                    setOpens((prev) => ({
                                      ...prev,
                                      campus: false,
                                    }));
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
                                    {campus.name} ({campus.slug.toUpperCase()})
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
                  <Popover
                    open={opens.college}
                    onOpenChange={(open) =>
                      setOpens((prev) => ({ ...prev, college: open }))
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="justify-between"
                        disabled={
                          form.formState.isSubmitting || !data || is_disabled
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
                                      setOpens((prev) => ({
                                        ...prev,
                                        college: false,
                                      }));
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
                  <Popover
                    open={opens.program}
                    onOpenChange={(open) =>
                      setOpens((prev) => ({ ...prev, program: open }))
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="justify-between"
                        disabled={
                          !form.getValues("college_id") ||
                          form.formState.isSubmitting ||
                          !data ||
                          is_disabled
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
                                      setOpens((prev) => ({
                                        ...prev,
                                        program: false,
                                      }));
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
        <div className="flex justify-between gap-10">
          <FormDescription className="text-balance">
            You can only change your role, campus, college, and program once
            every 3 months.
          </FormDescription>
          <FormDescription className="text-balance text-right">
            {currentUserTypeProgramQuery.data.program_changed_at
              ? `Last updated: ${format(
                  new Date(currentUserTypeProgramQuery.data.program_changed_at),
                  "MMMM dd, yyyy",
                )}`
              : "You have not updated your role, campus, college, and program yet."}
          </FormDescription>
        </div>
        <div className="flex justify-between gap-10">
          <div>
            {changeCurrentUserTypeProgramMutation.error && (
              <p className="text-balance text-sm text-destructive">
                {changeCurrentUserTypeProgramMutation.error.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={
              !form.formState.isValid ||
              form.formState.isSubmitting ||
              is_disabled ||
              (currentUserTypeProgram.program_id ===
                form.getValues("program_id") &&
                currentUserTypeProgram.type === form.getValues("type"))
            }
          >
            {!form.formState.isSubmitting ? "Save" : "Saving..."}
          </Button>
        </div>
      </form>
    </Form>
  );
}
