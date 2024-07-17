"use client";

import { Fragment, useEffect } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useInView } from "react-intersection-observer";

import type { POST_TYPE_TABS } from "@kabsu.me/constants";

import { api } from "~/lib/trpc/client";
import Header from "./header";
import { Icons } from "./icons";
import Post from "./post";
import PostForm from "./post-form";
import PostTypeTab from "./post-type-tab";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function HomeProtected({
  tab,
}: {
  tab?: "all" | "campus" | "program" | "college";
}) {
  const TABS_TITLE = {
    all: "See posts of all campuses.",
    campus: "See posts of your campus.",
    college: "See posts of your college.",
    program: "See posts of your program.",
  };
  return (
    <div className="border-x">
      <div className="sticky top-0 z-50">
        <Header />

        <PostTypeTab />
      </div>

      <div className="border-b p-3 text-center sm:hidden">
        <p className="text-sm capitalize text-primary">
          {tab ? tab : "following"} tab
        </p>
        <p className="text-xs text-muted-foreground">
          {tab ? TABS_TITLE[tab] : "See posts of who you are following."}
        </p>
      </div>

      <div className="min-h-screen">
        <PostForm hasRedirect />

        <Posts tab={tab ? tab : "following"} />
      </div>
      <div className="fixed bottom-0 right-0 p-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="icon" className="size-14 rounded-full">
              <Link href="/chat">
                <MessageCircle size="1.5rem" color="white" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Messages</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function Posts({ tab }: { tab: (typeof POST_TYPE_TABS)[number]["id"] }) {
  const posts = api.posts.getPosts.useInfiniteQuery(
    { type: tab },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1, // <-- optional you can pass an initialCursor
      // refetchOnMount: false,
      // refetchOnWindowFocus: false,
      // refetchOnReconnect: false,
    },
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    void (async () => {
      if (inView) {
        await posts.fetchNextPage();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div className="">
      {posts.isLoading ? (
        <div className="grid size-full place-items-center p-40">
          <Icons.spinner className="animate-spin" />
        </div>
      ) : !posts.data || posts.isError ? (
        <p className="text-center text-sm text-muted-foreground">
          {posts.error?.message ?? "An error occurred."}
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
