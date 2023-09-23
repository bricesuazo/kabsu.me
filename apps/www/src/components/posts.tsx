"use client";

import { Fragment, useEffect } from "react";
import { api } from "@/lib/trpc/client";
import { useInView } from "react-intersection-observer";

import type { POST_TYPE_TABS } from "@cvsu.me/constants";

import { Icons } from "./icons";
import Post from "./post";
import { PostSkeletonNoRandom } from "./post-skeleton";

export default function Posts({
  tab,
}: {
  tab: (typeof POST_TYPE_TABS)[number]["id"];
}) {
  const { ref, inView } = useInView();
  const posts = api.posts.getPosts.useInfiniteQuery(
    { type: tab },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1, // <-- optional you can pass an initialCursor
    },
  );

  // const [page, setPage] = useState<
  //   ReturnType<typeof api.posts.getPosts.useInfiniteQuery>["data"]
  // >([]);

  useEffect(() => {
    void (async () => {
      if (inView) {
        await posts.fetchNextPage();
      }
    })();
  }, [inView]);

  return (
    <div className="">
      {posts.isLoading ? (
        <>
          {[...(Array(6) as number[])].map((_, i) => (
            <PostSkeletonNoRandom key={i} />
          ))}
        </>
      ) : !posts.data && posts.isError ? (
        <p className="text-center text-sm text-muted-foreground">
          {posts.error.message}
        </p>
      ) : posts.data.pages.flatMap((page) => page.posts).length === 0 ? (
        <div className="flex justify-center p-8">
          There are no posts to show.
        </div>
      ) : (
        <>
          {posts.data.pages.map((page) => (
            <Fragment key={page.nextCursor}>
              {page.posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  isMyPost={post.user.id === page.userId}
                  userId={page.userId}
                  data-superjson
                />
              ))}
            </Fragment>
          ))}
          <div
            className="flex justify-center border-b p-8 text-center text-sm text-muted-foreground"
            ref={ref}
          >
            {posts.isFetchingNextPage && posts.hasNextPage ? (
              <Icons.spinner className="animate-spin" />
            ) : (
              "You've reached the end of the page."
            )}
          </div>
        </>
      )}
    </div>
  );
}
