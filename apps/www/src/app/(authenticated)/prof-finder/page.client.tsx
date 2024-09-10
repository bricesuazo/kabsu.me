"use client";

import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  ChevronsUpDown,
  Clock9,
  Loader2,
  MessageCircle,
  NotebookPen,
  ScanSearch,
  Trash2,
  UserRoundMinus,
  UserRoundPlus,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";
import { cn } from "@kabsu.me/ui";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@kabsu.me/ui/alert-dialog";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@kabsu.me/ui/select";
import { Textarea } from "@kabsu.me/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kabsu.me/ui/tooltip";

import type { Database } from "../../../../../../supabase/types";
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

export default function ProfFinderPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filter, setFilter] = useState<
    Database["public"]["Enums"]["global_chat_type"]
  >(
    (searchParams.get("filter") as
      | Database["public"]["Enums"]["global_chat_type"]
      | null) ?? "program",
  );

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

  const getMyUniversityStatusQuery = api.auth.getMyUniversityStatus.useQuery();
  const getProfPostsQuery = api.profFinder.getProfPosts.useQuery({ filter });
  const getCurrentUserQuery = api.auth.getCurrentUser.useQuery();

  return (
    <div>
      <div className="flex h-40 flex-col items-center justify-center gap-1 border-b bg-gradient-to-tr from-primary/30 to-yellow-500/10 p-4">
        <ScanSearch className="size-10" />
        <h4 className="text-center text-3xl font-bold">Prof Finder</h4>
        <p className="text-balance text-center text-sm text-muted-foreground">
          Find professors and teaching assistants at your university.
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-center gap-2">
          <Select
            value={filter}
            onValueChange={(
              value: Database["public"]["Enums"]["global_chat_type"],
            ) => {
              setFilter(value);
              const url = new URL(window.location.href);
              url.searchParams.set("filter", value);
              router.replace(url.toString());
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filter</SelectLabel>
                {[
                  {
                    value: "campus",
                    label: "Campus",
                  },
                  {
                    value: "college",
                    label: "College",
                  },
                  {
                    value: "program",
                    label: "Program",
                  },
                ].map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                    {getMyUniversityStatusQuery.data &&
                      " (" +
                        (() => {
                          switch (item.value) {
                            case "program":
                              return getMyUniversityStatusQuery.data.programs?.slug.toUpperCase();
                            case "college":
                              return getMyUniversityStatusQuery.data.programs?.colleges?.slug.toUpperCase();
                            case "campus":
                              return getMyUniversityStatusQuery.data.programs?.colleges?.campuses?.slug.toUpperCase();
                          }
                        })() +
                        ")"}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {getCurrentUserQuery.data?.type === "faculty" && (
            <ProfPostForm form={form} data={{ type: "create" }} />
          )}
        </div>

        {getProfPostsQuery.data === undefined ? (
          <p className="p-4 text-center">Loading...</p>
        ) : getProfPostsQuery.data.length === 0 ? (
          <p className="p-4 text-center">No posts found</p>
        ) : (
          <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 2 }}
          >
            <Masonry gutter="16px">
              {getProfPostsQuery.data.map((prof_post) => (
                <ProfPostItem
                  key={prof_post.id}
                  prof_post={prof_post}
                  is_my_post={
                    getCurrentUserQuery.data?.id === prof_post.user_id
                  }
                />
              ))}
            </Masonry>
          </ResponsiveMasonry>
        )}
      </div>
    </div>
  );
}

function ProfPostItem({
  prof_post,
  is_my_post,
}: {
  is_my_post: boolean;
  prof_post: RouterOutputs["profFinder"]["getProfPosts"][number];
}) {
  const utils = api.useUtils();
  const archiveProfPostMutation = api.profFinder.archiveProfPost.useMutation({
    onSuccess: async () => {
      await utils.profFinder.getProfPosts.invalidate();
      setOpenDeleteProfPost(false);
    },
  });
  const isFollowerQuery = api.users.isFollower.useQuery({
    user_id: prof_post.user_id,
  });
  const followMutation = api.users.follow.useMutation({
    onSuccess: () => isFollowerQuery.refetch(),
  });
  const unfollowMutation = api.users.unfollow.useMutation({
    onSuccess: () => isFollowerQuery.refetch(),
  });
  const [openDeleteProfPost, setOpenDeleteProfPost] = useState(false);
  const isFollowLoading =
    isFollowerQuery.isLoading ||
    followMutation.isPending ||
    unfollowMutation.isPending;

  // const form = useForm<z.infer<typeof FormSchema>>({
  //   resolver: zodResolver(FormSchema),
  //   defaultValues: {
  //     description: prof_post.description,
  //     programs: prof_post.prof_posts_programs.map((program) => ({
  //       id: program.program_id,
  //       year: program.year.toString(),
  //       section: program.section.toString(),
  //     })),
  //   },
  // });
  return (
    <div className="flex flex-col gap-y-4 rounded-md border p-4">
      <div className="flex gap-2">
        {/* add img tag here */}
        <Image
          src={
            prof_post.user.image_name
              ? prof_post.user.image_url
              : "/default-avatar.jpg"
          }
          alt={`${prof_post.user.name} profile picture`}
          className="rounded-full"
          width={40}
          height={40}
        />
        <div className="flex flex-col">
          <p className="line-clamp-2 flex-1">{prof_post.user.name}</p>
          <div className="flex gap-1 text-xs text-muted-foreground">
            <Clock9 className="h-4 w-fit" />
            <p>
              {formatDistanceToNow(prof_post.created_at, {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      </div>
      {prof_post.description.length > 0 && (
        <div className="flex flex-col">
          <p className="text-xs text-muted-foreground">Description</p>
          <p>{prof_post.description}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {prof_post.prof_posts_programs.map((program) => (
          <p
            key={program.id}
            className="w-fit rounded-full bg-muted px-4 py-1 text-xs font-semibold"
          >
            {program.program.slug.toUpperCase()} {program.year}-
            {program.section}
          </p>
        ))}
      </div>

      {is_my_post ? (
        <div className="flex items-center gap-2">
          {/* <ProfPostForm form={form} data={{ type: "edit", id: prof_post.id }} /> */}

          <AlertDialog
            open={openDeleteProfPost}
            onOpenChange={setOpenDeleteProfPost}
          >
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="size-5 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your post.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() =>
                    archiveProfPostMutation.mutateAsync({ id: prof_post.id })
                  }
                  disabled={archiveProfPostMutation.isPending}
                >
                  {archiveProfPostMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                      Archiving...
                    </>
                  ) : (
                    "Archive"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-10 flex-1" asChild>
            <Link href={`/${prof_post.user.username}`}>View profile</Link>
          </Button>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  isFollowerQuery.data
                    ? unfollowMutation.mutate({ user_id: prof_post.user_id })
                    : followMutation.mutate({ user_id: prof_post.user_id })
                }
                disabled={isFollowLoading}
              >
                {isFollowLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isFollowerQuery.data ? (
                  <UserRoundPlus className="size-5" />
                ) : (
                  <UserRoundMinus className="size-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFollowerQuery.data ? "Unfollow" : "Follow"}
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild>
                <Link href={`/chat/user/${prof_post.user.id}`}>
                  <MessageCircle className="size-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Message</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

function ProgramItem({
  form,
  index,
  program,
  programs,
  onDelete,
}: {
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  index: number;
  program: z.infer<typeof FormSchema>["programs"][number];
  programs: RouterOutputs["profFinder"]["getAllPrograms"];
  onDelete: () => void;
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
                      onClick={() => {
                        form.setValue("programs", [
                          ...form.getValues("programs").slice(0, index),
                          ...form.getValues("programs").slice(index + 1),
                        ]);
                        onDelete();
                      }}
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

function ProfPostForm({
  form,
  data,
}: {
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  data: { type: "create" } | { type: "edit"; id: string };
}) {
  const [programsToDelete, setProgramsToDelete] = useState<string[]>([]);
  const [openCreateProfPost, setOpenCreateProfPost] = useState(false);
  const utils = api.useUtils();
  const createProfPostMutation = api.profFinder.createProfPost.useMutation({
    onSuccess: async () => {
      await utils.profFinder.getProfPosts.invalidate();
      form.reset();
      setOpenCreateProfPost(false);
    },
  });
  const editProfPostMutation = api.profFinder.editProfPost.useMutation({
    onSuccess: async () => {
      await utils.profFinder.getProfPosts.invalidate();
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
  return (
    <Dialog
      open={openCreateProfPost}
      onOpenChange={(value) => {
        if (value) form.reset();
        setOpenCreateProfPost(value);
      }}
    >
      <DialogTrigger asChild>
        {data.type === "create" ? (
          <Button size="sm">
            <NotebookPen className="mr-1.5 size-4" />
            Create Post
          </Button>
        ) : (
          <Button size="sm" className="h-10 flex-1" variant="outline">
            Edit details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NotebookPen className="size-4" />
            {data.type === "create" ? "Create Post" : "Edit Post"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              data.type === "create"
                ? createProfPostMutation.mutateAsync(values)
                : editProfPostMutation.mutateAsync({
                    id: data.id,
                    description: values.description,
                    programsToDelete,
                    programs: values.programs,
                  }),
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
                    <Textarea
                      placeholder="ABCD 123 - Subject Name"
                      {...field}
                    />
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
                    onDelete={() =>
                      setProgramsToDelete([...programsToDelete, program.id])
                    }
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
  );
}
