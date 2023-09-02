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

export default function PostForm() {
  const form = useForm<CreatePostSchema>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      post: "",
    },
  });

  async function onSubmit(values: CreatePostSchema) {
    await createPost(values);

    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="post"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post</FormLabel>
              <FormControl>
                <Textarea placeholder="What's on your mind?" {...field} />
              </FormControl>
              <FormDescription>
                This will be visible to your followers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}{" "}
          Post
        </Button>
      </form>
    </Form>
  );
}
