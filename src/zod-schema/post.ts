import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().nonempty({ message: "Post cannot be empty." }).max(512, {
    message: "Post cannot be longer than 512 characters.",
  }),
});

export type CreatePostSchema = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  post_id: z.string().min(1),
  content: z.string().min(1, { message: "Post cannot be empty." }),
});

export type UpdatePostSchema = z.infer<typeof updatePostSchema>;
