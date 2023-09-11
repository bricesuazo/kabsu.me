import { POST_TYPE } from "@/db/schema";
import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .nonempty({ message: "Post cannot be empty." })
    .max(512, {
      message: "Post cannot be longer than 512 characters.",
    }),
  type: z.enum(POST_TYPE).default(POST_TYPE[0]),
});

export type CreatePostSchema = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  post_id: z.string().min(1),
  content: z.string().min(1, { message: "Post cannot be empty." }),
});

export type UpdatePostSchema = z.infer<typeof updatePostSchema>;
