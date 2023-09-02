import { z } from "zod";

export const createPostSchema = z.object({
  post: z.string().min(1, { message: "Post cannot be empty." }),
});

export type CreatePostSchema = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  post_id: z.string().min(1),
  post: z.string().min(1, { message: "Post cannot be empty." }),
});

export type UpdatePostSchema = z.infer<typeof updatePostSchema>;
