"use client";

import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";

import type { RouterOutputs } from "@kabsu.me/api";

import { Icons } from "~/components/icons";
import Post from "~/components/post";
import { PostSkeletonNoRandom } from "~/components/post-skeleton";
import { api } from "~/lib/trpc/client";

export default function PostsWrapper({
  user,
}: {
  user: RouterOutputs["users"]["getUserProfile"]["user"];
}) {
  const { ref, inView } = useInView();
  const postsQuery = api.posts.getUserPosts.useInfiniteQuery(
    { user_id: user.id },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1, // <-- optional you can pass an initialCursor
    },
  );

  useEffect(() => {
    void (async () => {
      if (inView) {
        await postsQuery.fetchNextPage();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div>
      {postsQuery.isLoading ? (
        <div className="">
          {[...(Array(6) as number[])].map((_, i) => (
            <PostSkeletonNoRandom key={i} />
          ))}
        </div>
      ) : !postsQuery.data || postsQuery.isError ? (
        <p className="text-center text-sm text-muted-foreground">
          {postsQuery.error?.message ?? "An error occurred."}
        </p>
      ) : postsQuery.data.pages.flatMap((page) => page.posts).length === 0 ? (
        <div className="text-center">
          <div className="text-2xl font-semibold">No posts yet</div>
          <div className="mt-2 break-words text-gray-500">
            When @{user.username} posts something, it will show up here.
          </div>
        </div>
      ) : (
        postsQuery.data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </Fragment>
        ))
      )}
      <div
        className="flex justify-center p-8 text-center text-sm text-muted-foreground"
        ref={ref}
      >
        {postsQuery.isFetchingNextPage && postsQuery.hasNextPage ? (
          <Icons.spinner className="animate-spin" />
        ) : (
          "You've reached the end of the page."
        )}
      </div>
    </div>
  );
}
