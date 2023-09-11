"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CreatePostSchema, createPostSchema } from "@/zod-schema/post";
import { createPost } from "@/actions/post";
import { Icons } from "./icons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { POST_TYPE } from "@/db/schema";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { useUser } from "@clerk/nextjs";

export default function PostForm() {
  const { user } = useUser();
  const [isFocused, setIsFocused] = useState(false);
  const form = useForm<CreatePostSchema>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      type: "following",
      content: "",
    },
  });

  async function onSubmit(values: CreatePostSchema) {
    await createPost(values);

    form.reset();
  }

  // disable set focus if esc is pressed
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isFocused) return;

      if (e.key === "Escape") {
        form.reset();
        setIsFocused(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused, form]);

  return (
    <div
      // className="xs:flex hidden gap-x-4"
      className="flex gap-x-4"
    >
      {!user?.imageUrl ? (
        <Skeleton className="h-10 w-10 rounded-full" />
      ) : (
        <div className="min-w-max">
          <Image
            src={user.imageUrl}
            alt="Profile picture"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-4"
        >
          <div className="flex gap-x-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  {/* <FormLabel>Post</FormLabel> */}
                  <FormControl>
                    {!isFocused ? (
                      <Input
                        placeholder="What's on your mind?"
                        className="text-base"
                        onFocus={() => setIsFocused(true)}
                      />
                    ) : (
                      <Textarea
                        placeholder="What's on your mind?"
                        className="text-base"
                        autoFocus
                        maxLength={256}
                        {...field}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isFocused && <Button disabled>Post</Button>}
          </div>

          {isFocused && (
            <div className="flex items-center justify-between gap-x-2">
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
                            {POST_TYPE.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
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
          )}
        </form>
      </Form>
    </div>
  );
}
