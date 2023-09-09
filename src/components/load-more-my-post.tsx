"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Icons } from "./icons";
import Post from "./post";
import { User } from "@clerk/nextjs/server";
import { Campus, College, Post as PostType, Program } from "@/db/schema";
import { getUserPosts } from "@/actions/post";

export function LoadMoreUserPost({ user_id }: { user_id: string }) {
  const [posts, setPosts] = useState<
    (PostType & {
      user: User & {
        program: Program & { college: College & { campus: Campus } };
      };
    })[]
  >([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const { ref, inView } = useInView();

  const loadMorePosts = async () => {
    setLoading(true);
    // const nextPage = (page % 7) + 1;
    const nextPage = page + 1;
    const newPosts = (await getUserPosts({ page: nextPage, user_id })) ?? [];
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
          <Post key={post.id} post={post} isMyPost={post.user.id === user_id} />
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
