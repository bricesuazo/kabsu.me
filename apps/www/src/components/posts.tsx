"use client";

import { Fragment, useEffect } from "react";
import { api } from "@/lib/trpc/client";
import { useInView } from "react-intersection-observer";

import type { POST_TYPE_TABS } from "@cvsu.me/constants";

import { Icons } from "./icons";
import Post from "./post";

export default function Posts({
  tab,
}: {
  tab: (typeof POST_TYPE_TABS)[number]["id"];
}) {
  const posts = api.posts.getPosts.useInfiniteQuery(
    { type: tab },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1, // <-- optional you can pass an initialCursor
    },
  );

  const { ref, inView } = useInView();

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
        <div className="grid h-full w-full place-items-center p-40">
          <Icons.spinner className="animate-spin" />
        </div>
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
                <Post key={post.id} post={post} />
              ))}
            </Fragment>
          ))}
          <span
            ref={ref}
            className="flex justify-center border-b p-8 text-center text-sm text-muted-foreground"
          >
            {posts.isFetchingNextPage && posts.hasNextPage ? (
              <Icons.spinner className="animate-spin" />
            ) : (
              "You've reached the end of the page."
            )}
          </span>
        </>
      )}
    </div>
  );
}
