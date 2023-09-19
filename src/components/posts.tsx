"use client";

import Post from "./post";
import { useInView } from "react-intersection-observer";
import { POST_TYPE_TABS } from "@/lib/constants";
import { api } from "@/lib/trpc/client";
import { PostSkeletonNoRandom } from "./post-skeleton";
import { Fragment, useEffect } from "react";
import { Icons } from "./icons";

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
    if (inView) {
      posts.fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="">
      {posts.isLoading ? (
        <>
          {[...Array(6)].map((_, i) => (
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
          {posts.data.pages.map((page, i) => (
            <Fragment key={i}>
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
            className="flex justify-center p-8 text-center text-sm text-muted-foreground"
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
