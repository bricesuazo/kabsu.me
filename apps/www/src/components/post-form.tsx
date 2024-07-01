"use client";

import type { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { ImageUp, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { v4 } from "uuid";
import { z } from "zod";

import { POST_TYPE_TABS } from "@kabsu.me/constants";

import type { Database } from "../../../../supabase/types";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { useMediaQuery } from "~/hooks/use-media-query";
import { api } from "~/lib/trpc/client";
import { createClient } from "~/supabase/client";
import { FileUploader } from "./file-uploader";
import { Icons } from "./icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const typeSchema = z
  .custom<Database["public"]["Enums"]["post_type"]>()
  .default("following");
const contentSchema = z
  .string()
  .trim()
  .min(1, { message: "Post cannot be empty." })
  .max(512, {
    message: "Post cannot be longer than 512 characters.",
  });
const imagesSchema = z.instanceof(File).array();

const Schema = z.object({
  type: typeSchema,
  content: contentSchema,
  images: imagesSchema,
});

export default function PostForm({ hasRedirect }: { hasRedirect?: boolean }) {
  const context = api.useUtils();
  const getCurrentUserQuery = api.auth.getCurrentUser.useQuery();
  const [imageUploaderOpen, setImageUploaderOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      type: searchParams.has("tab")
        ? (searchParams.get("tab") as Database["public"]["Enums"]["post_type"])
        : "following",
      content: "",
      images: [],
    },
  });

  const createPostMutation = api.posts.create.useMutation();

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (searchParams.has("tab")) {
      form.setValue(
        "type",
        searchParams.get("tab") as Database["public"]["Enums"]["post_type"],
      );
    } else {
      form.setValue("type", "following");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isFocused) return;

      if (e.key === "Escape") {
        form.resetField("content");
        setIsFocused(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  async function handleSubmit() {
    await form.handleSubmit(async (values) => {
      const supabase = createClient();

      const images = values.images.map((image, index) => ({
        image,
        name: v4(),
        order: index,
      }));

      const { signed_urls } = await createPostMutation.mutateAsync({
        type: values.type,
        content: values.content,
        images,
      });

      await Promise.all(
        signed_urls.map(async (url) => {
          const file = images.find(
            (image) => image.name === url.path.split("/").pop(),
          )?.image;

          if (!file) return;

          const compressedImage = await imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 720,
            useWebWorker: true,
          });

          await supabase.storage
            .from("posts")
            .uploadToSignedUrl(url.path, url.token, compressedImage);
        }),
      );

      if (hasRedirect) {
        router.push(
          form.getValues("type") === "following"
            ? "/"
            : `/?tab=${form.getValues("type")}`,
        );
      } else {
        await Promise.all([
          context.users.getUserProfile.reset(),
          context.posts.getUserPosts.reset(),
        ]);
      }
      await context.posts.getPosts.invalidate({
        type: form.getValues("type"),
      });
      form.reset();
    })();
  }

  return (
    <div className="flex gap-x-2 border-b px-4 py-8">
      {!getCurrentUserQuery.data ? (
        <Skeleton className="h-10 w-10 rounded-full" />
      ) : (
        <Link
          href={`/${getCurrentUserQuery.data.username}`}
          className="relative aspect-square h-8 w-8 min-w-max xs:h-10 xs:w-10"
        >
          <Image
            src={
              getCurrentUserQuery.data.image_name
                ? getCurrentUserQuery.data.image_url
                : "/default-avatar.jpg"
            }
            alt="Profile picture"
            width={40}
            height={40}
            className="aspect-square rounded-full object-cover object-center"
          />
        </Link>
      )}
      <Form {...form}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmit();
          }}
          className="flex-1 space-y-4"
        >
          {isDesktop ? (
            <Dialog
              open={imageUploaderOpen}
              onOpenChange={setImageUploaderOpen}
            >
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upload images</DialogTitle>
                </DialogHeader>
                <ImageUpload
                  form={form}
                  setImageUploaderOpen={setImageUploaderOpen}
                />
                <Button onClick={() => setImageUploaderOpen(false)}>
                  Save
                </Button>
              </DialogContent>
            </Dialog>
          ) : (
            <Drawer
              open={imageUploaderOpen}
              onOpenChange={setImageUploaderOpen}
            >
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle>Upload images</DrawerTitle>
                </DrawerHeader>
                <div className="px-4">
                  <ImageUpload
                    form={form}
                    setImageUploaderOpen={setImageUploaderOpen}
                  />
                </div>
                <DrawerFooter className="pt-2">
                  <DrawerClose asChild>
                    <Button>Save</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
          <div className="flex gap-x-2">
            {!isFocused ? (
              <input
                style={{
                  width: "100%",
                }}
                placeholder="What's on your mind?"
                className="text-base [all:unset]"
                onFocus={() => setIsFocused(true)}
              />
            ) : (
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1 py-2">
                      {/* <FormLabel>Post</FormLabel> */}
                      <FormControl>
                        <TextareaAutosize
                          placeholder="What's on your mind?"
                          style={{ width: "100%" }}
                          className="text-base [all:unset]"
                          autoFocus
                          maxLength={256}
                          maxRows={6}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              e.preventDefault();
                              await handleSubmit();
                            }
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-x-2">
                    {form.getValues("images").map((file, index) => (
                      <div key={index} className="group relative mb-4 shrink-0">
                        <div className="absolute grid h-full w-full place-items-center bg-black/50 opacity-0 transition-colors group-hover:opacity-100">
                          <Button
                            variant="destructive"
                            size="icon"
                            type="button"
                            onClick={async () => {
                              const images = form.watch("images");

                              form.setValue("images", [
                                ...images.filter((_, i) => i !== index),
                              ]);
                              await form.trigger("images");
                            }}
                          >
                            <Trash className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                        <Image
                          src={URL.createObjectURL(file)}
                          alt="Image preview"
                          className="pointer-events-none aspect-square select-none rounded object-cover object-center"
                          width={100}
                          height={100}
                        />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}
            {!isFocused && <Button disabled>Post</Button>}
          </div>
          {isFocused && (
            <div className="flex justify-between gap-x-2">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="text-muted-foreground hover:text-secondary-foreground"
                    onClick={() => setImageUploaderOpen(true)}
                  >
                    <ImageUp />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload images</TooltipContent>
              </Tooltip>

              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Post type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Privacy</SelectLabel>
                              {POST_TYPE_TABS.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.id === "following"
                                    ? "Follower"
                                    : type.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="flex-1 text-xs text-muted-foreground xs:text-sm">
                  This post will be visible to{" "}
                  {form.watch("type") === "following"
                    ? "your followers"
                    : form.watch("type") === "all"
                      ? "all campuses"
                      : "your " + form.watch("type")}
                </p>
              </div>
              <div className="flex gap-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  disabled={form.formState.isSubmitting}
                  onClick={() => {
                    form.reset();
                    setIsFocused(false);
                  }}
                >
                  <Trash className="h-4 w-4 text-rose-500" />
                </Button>
                <Button
                  type="submit"
                  disabled={
                    form.formState.isSubmitting || !form.formState.isValid
                  }
                >
                  {form.formState.isSubmitting && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

function ImageUpload({
  form,
  setImageUploaderOpen,
}: {
  form: UseFormReturn<
    {
      content: string;
      type: "following" | "program" | "college" | "campus" | "all";
      images: File[];
    },
    unknown,
    undefined
  >;
  setImageUploaderOpen: (open: boolean) => void;
}) {
  return (
    <FormField
      control={form.control}
      name="images"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <FileUploader
              value={field.value}
              onValueChange={(props) => {
                field.onChange(props);
                setImageUploaderOpen(false);
              }}
              maxSize={1024 * 1024 * 5} // 5MB
              disabled={form.formState.isSubmitting}
              maxFiles={9}
              itemType="image/*"
              multiple
            />
          </FormControl>
          <FormMessage />

          <ScrollArea className="w-96 whitespace-nowrap pb-4">
            <div className="flex gap-x-2">
              {field.value.map((file, index) => (
                <div key={index} className="group relative shrink-0">
                  <div className="absolute grid h-full w-full place-items-center bg-black/50 opacity-0 transition-colors group-hover:opacity-100">
                    <Button
                      variant="destructive"
                      size="icon"
                      type="button"
                      onClick={async () => {
                        field.onChange(
                          field.value.filter((_, i) => i !== index),
                        );
                        await form.trigger("images");
                      }}
                    >
                      <Trash className="h-4 w-4 text-rose-500" />
                    </Button>
                  </div>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="Image preview"
                    className="pointer-events-none aspect-square select-none rounded object-cover object-center"
                    width={200}
                    height={200}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </FormItem>
      )}
    />
  );
}
