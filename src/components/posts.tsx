"use client";

import Post from "./post";
import { POST_TYPE_TABS } from "@/lib/constants";
import { LoadMorePost } from "./load-more-post";
import { api } from "@/lib/trpc/client";
import { PostSkeletonNoRandom } from "./post-skeleton";

export default function Posts({
  tab,
}: {
  tab: (typeof POST_TYPE_TABS)[number]["id"];
}) {
  const posts = api.posts.getPosts.useQuery({ type: tab, page: 1 });

  return (
    <div className="flex flex-col">
      {!posts.data || posts.isLoading ? (
        <>
          {[...Array(6)].map((_, i) => (
            <PostSkeletonNoRandom key={i} />
          ))}
        </>
      ) : posts.data.posts.length === 0 ? (
        <div className="flex justify-center p-8">
          There are no posts to show.
        </div>
      ) : (
        <>
          {posts.data.posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              isMyPost={post.user.id === posts.data.userId}
              userId={posts.data.userId}
              data-superjson
            />
          ))}
          {/* <LoadMorePost type={tab} userId={userId} /> */}
        </>
      )}
    </div>
  );
}
