"use client";

import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { Check, ChevronsUpDown, Loader2, ScanSearch, X } from "lucide-react";
import { useForm } from "react-hook-form";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";
import { cn } from "@kabsu.me/ui";
import { Button } from "@kabsu.me/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kabsu.me/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kabsu.me/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kabsu.me/ui/form";
import { Input } from "@kabsu.me/ui/input";
import { Label } from "@kabsu.me/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@kabsu.me/ui/popover";
import { ScrollArea } from "@kabsu.me/ui/scroll-area";
import { Textarea } from "@kabsu.me/ui/textarea";

import { api } from "~/lib/trpc/client";

const FormSchema = z.object({
  description: z.string(),
  programs: z.array(
    z.object({
      id: z.string().uuid({ message: "Invalid program" }),
      year: z.string().min(1, { message: "Invalid year" }),
      section: z.string().min(1, { message: "Invalid section" }),
    }),
  ),
});

export default function ProfFinderPage() {
  const [openCreateProfPost, setOpenCreateProfPost] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: "",
      programs: [
        {
          id: "",
          year: "1",
          section: "1",
        },
      ],
    },
  });
  const createProfPostMutation = api.profFinder.createProfPost.useMutation({
    onSuccess: async () => {
      await getProfPostsQuery.refetch();
      form.reset();
      setOpenCreateProfPost(false);
    },
  });
  const getAllProgramsQuery = api.profFinder.getAllPrograms.useQuery(
    undefined,
    {
      enabled: openCreateProfPost,
    },
  );
  const getProfPostsQuery = api.profFinder.getProfPosts.useQuery();
  const getCurrentUserQuery = api.auth.getCurrentUser.useQuery();

  return (
    <div>
      <div className="flex h-40 flex-col items-center justify-center border-b p-4">
        <ScanSearch />
        <h4 className="text-center text-2xl font-bold">Prof Finder</h4>
        <p className="text-balance text-center text-sm text-muted-foreground">
          Find professors and teaching assistants at your university.
        </p>
      </div>

      <div className="p-4">
        {getCurrentUserQuery.data?.type === "faculty" && (
          <Dialog
            open={openCreateProfPost}
            onOpenChange={setOpenCreateProfPost}
          >
            <DialogTrigger asChild>
              <Button>Create Post</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Post</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) =>
                    createProfPostMutation.mutateAsync(values),
                  )}
                  className="flex flex-col gap-y-4"
                >
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description" {...field} />
                        </FormControl>
                        <FormDescription>
                          Describe the course you are teaching.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col gap-y-2">
                    <div className="grid grid-cols-5 gap-2">
                      <Label className="col-span-3">Program</Label>
                      <Label>Year</Label>
                      <Label>Section</Label>
                    </div>
                    <ScrollArea viewportClassName="max-h-40">
                      {form.watch("programs").map((program, index) => (
                        <ProgramItem
                          key={index}
                          form={form}
                          index={index}
                          program={program}
                          programs={getAllProgramsQuery.data ?? []}
                        />
                      ))}
                    </ScrollArea>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        form.setValue("programs", [
                          ...form.getValues("programs"),
                          { id: "", year: "1", section: "1" },
                        ])
                      }
                    >
                      Add Program
                    </Button>
                  </div>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}

        {getProfPostsQuery.data === undefined ? (
          <p className="p-4">Loading...</p>
        ) : getProfPostsQuery.data.length === 0 ? (
          <p className="p-4">No posts found</p>
        ) : (
          <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3 }}
          >
            <Masonry gutter="16px">
              {getProfPostsQuery.data.map((prof_post) => (
                <div
                  key={prof_post.id}
                  className="flex flex-col gap-y-2 rounded-md border p-4"
                >
                  <div className="flex gap-2">
                    <p className="line-clamp-2 flex-1">
                      {prof_post.user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(prof_post.created_at)}
                    </p>
                  </div>
                  {prof_post.description.length > 0 && (
                    <div className="flex flex-col">
                      <p className="text-xs text-muted-foreground">
                        Description
                      </p>
                      <p>{prof_post.description}</p>
                    </div>
                  )}
                  <ul className="list-inside list-decimal">
                    {prof_post.prof_posts_programs.map((program) => {
                      if (!program.program) return null;
                      return (
                        <li key={program.id}>
                          {program.program.slug.toUpperCase()} {program.year}-
                          {program.section}
                        </li>
                      );
                    })}
                  </ul>

                  {getCurrentUserQuery.data?.id !== prof_post.user_id &&
                    prof_post.user && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/${prof_post.user.username}`}>
                            View profile
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/chat/user/${prof_post.user.id}`}>
                            Message
                          </Link>
                        </Button>
                      </div>
                    )}
                </div>
              ))}
            </Masonry>
          </ResponsiveMasonry>
        )}
      </div>
    </div>
  );
}

function ProgramItem({
  form,
  index,
  program,
  programs,
}: {
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  index: number;
  program: z.infer<typeof FormSchema>["programs"][number];
  programs: RouterOutputs["profFinder"]["getAllPrograms"];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2 grid grid-cols-5 gap-2">
      <FormField
        control={form.control}
        name={`programs.${index}.id`}
        render={({ field }) => (
          <FormItem className="col-span-3">
            <FormControl>
              <div className="flex w-full items-center gap-1">
                {index !== 0 && (
                  <div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="aspect-square size-8 rounded-full"
                      onClick={() =>
                        form.setValue("programs", [
                          ...form.getValues("programs").slice(0, index),
                          ...form.getValues("programs").slice(index + 1),
                        ])
                      }
                    >
                      <X className="size-4 text-destructive" />
                    </Button>
                  </div>
                )}
                <Popover modal open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full",
                        form.formState.errors.programs?.[index]?.id &&
                          "border-destructive",
                      )}
                    >
                      <p className="w-full truncate text-left">
                        {program.id.length > 0
                          ? programs
                              .find(
                                (program_item) =>
                                  program_item.id === field.value,
                              )
                              ?.slug.toUpperCase()
                          : "Select program..."}
                      </p>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command
                      filter={(value, search) =>
                        value.toLowerCase().includes(search.toLowerCase())
                          ? 1
                          : 0
                      }
                    >
                      <CommandInput placeholder="Search program..." />
                      <CommandList>
                        <CommandEmpty>No program found.</CommandEmpty>
                        <CommandGroup>
                          {programs.map((program_item) => (
                            <CommandItem
                              key={program_item.id}
                              value={`${
                                program_item.name
                              } (${program_item.slug.toUpperCase()})`}
                              onSelect={() => {
                                field.onChange(program_item.id);
                                setOpen(false);
                              }}
                            >
                              <div>
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    program.id === program_item.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </div>
                              {program_item.name} (
                              {program_item.slug.toUpperCase()})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`programs.${index}.year`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type="number" min={1} placeholder="Year" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`programs.${index}.section`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type="number" min={1} placeholder="Section" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
