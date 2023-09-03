import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1, { message: "Post cannot be empty." }),
});

export type CreatePostSchema = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  post_id: z.string().min(1),
  content: z.string().min(1, { message: "Post cannot be empty." }),
});

export type UpdatePostSchema = z.infer<typeof updatePostSchema>;
