"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Icons } from "./icons";
import Post from "./post";
import { POST_TYPE_TABS } from "@/lib/constants";
import { getPosts } from "@/actions/post";

export function LoadMorePost({
  userId,
  type,
}: {
  userId: string;
  type: (typeof POST_TYPE_TABS)[number]["id"];
}) {
  const [posts, setPosts] = useState<Awaited<ReturnType<typeof getPosts>>>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const { ref, inView } = useInView();

  const loadMorePosts = async () => {
    setLoading(true);
    // const nextPage = (page % 7) + 1;
    const nextPage = page + 1;
    const newPosts = (await getPosts({ page: nextPage, type })) ?? [];
    setPosts((prevPosts) => [...prevPosts, ...newPosts]);
    setPage(nextPage);
    setLoading(false);
  };

  useEffect(() => {
    if (inView) {
      loadMorePosts();
    }
  }, [inView]);

  return (
    <>
      {posts.map((post) => {
        if (!post.user) return null;
        return (
          <Post
            key={post.id}
            post={post}
            isMyPost={post.user.id === userId}
            userId={userId}
            data-superjson
          />
        );
      })}

      <div className="flex justify-center p-8" ref={ref}>
        {loading ? (
          <Icons.spinner className="animate-spin" />
        ) : (
          "You've reached the end of the page."
        )}
      </div>
    </>
  );
}
