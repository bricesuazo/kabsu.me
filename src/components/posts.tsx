import Post from "./post";
import { auth, clerkClient } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { getPosts } from "@/actions/post";
import { POST_TYPE_TABS } from "@/lib/constants";
import { LoadMorePost } from "./load-more-post";

export default async function Posts({
  tab,
}: {
  tab: (typeof POST_TYPE_TABS)[number]["id"];
}) {
  const { userId } = auth();

  if (!userId) notFound();

  const posts = await getPosts({ type: tab, page: 1 });

  return (
    <div className="flex flex-col">
      {posts.map((post) => {
        if (!post.user) return null;
        return (
          <Post key={post.id} post={post} isMyPost={post.user.id === userId} />
        );
      })}
      <LoadMorePost type={tab} userId={userId} />
    </div>
  );
}
