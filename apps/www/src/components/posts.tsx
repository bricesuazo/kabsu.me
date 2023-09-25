"use client";

import { Fragment } from "react";
import { api } from "@/lib/trpc/client";
import { InView } from "react-intersection-observer";

import type { POST_TYPE_TABS } from "@cvsu.me/constants";

import { Icons } from "./icons";
import Post from "./post";
import { PostSkeletonNoRandom } from "./post-skeleton";

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

  // const [page, setPage] = useState<
  //   ReturnType<typeof api.posts.getPosts.useInfiniteQuery>["data"]
  // >([]);

  return (
    <div className="">
      <InView as="div" onChange={(saf) => console.log(saf)}>
        jifbsihdfn
      </InView>
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
                  // isMyPost={post.user.id === page.userId}
                  // userId={page.userId}
                  // data-superjson
                />
              ))}
            </Fragment>
          ))}
          <InView
            as="div"
            onChange={async (inView, en) => {
              console.log("🚀 ~ file: posts.tsx:64 ~ onChange={ ~ en:", en);
              console.log(
                "🚀 ~ file: posts.tsx:64 ~ onChange={ ~ inView:",
                inView,
              );
              if (inView) {
                await posts.fetchNextPage();
              }
            }}
            className="flex justify-center border-b p-8 text-center text-sm text-muted-foreground"
          >
            {posts.isFetchingNextPage && posts.hasNextPage ? (
              <Icons.spinner className="animate-spin" />
            ) : (
              "You've reached the end of the page."
            )}
          </InView>
        </>
      )}
    </div>
  );
}
