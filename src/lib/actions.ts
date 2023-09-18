"use server";
import { api as api_server } from "@/lib/trpc/server";

export const testRevalidate = async () => {
  await api_server.posts.getPosts.revalidate();
};
