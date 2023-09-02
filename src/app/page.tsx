import { currentUser } from "@clerk/nextjs";
import PostForm from "@/components/post-form";
import Posts from "@/components/posts";
import { Suspense } from "react";
import { notFound } from "next/navigation";

export default async function Home() {
  const user = await currentUser();

  if (!user) notFound();

  return (
    <main className="space-y-8">
      <h2 className="text-2xl font-bold">Greetings, @{user.username}</h2>

      <PostForm />

      <Suspense fallback="Loading...">
        <Posts />
      </Suspense>
    </main>
  );
}
