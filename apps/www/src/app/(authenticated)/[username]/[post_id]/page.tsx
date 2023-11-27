import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@kabsu.me/auth";
import { db } from "@kabsu.me/db";

import PostPageComponent from "./post-page";

export async function generateMetadata({
  params,
}: {
  params: { username: string; post_id: string };
}): Promise<Metadata> {
  const session = await auth();

  if (!session) notFound();

  const currentUserInDB = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, session.user.id),
    with: {
      program: {
        with: {
          college: {
            with: { campus: true },
          },
        },
      },
    },
  });

  if (!currentUserInDB) notFound();

  const post1 = await db.query.posts.findFirst({
    where: (post, { eq, isNull, and }) =>
      and(eq(post.id, params.post_id), isNull(post.deleted_at)),
  });

  if (!post1) notFound();

  const userOfPost = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, post1.user_id),
    with: {
      program: {
        with: {
          college: {
            with: { campus: true },
          },
        },
      },
    },
  });

  if (!userOfPost) notFound();

  const isFollower = await db.query.followers.findFirst({
    where: (follower, { and, eq }) =>
      and(
        eq(follower.follower_id, session.user.id),
        eq(follower.followee_id, userOfPost.id),
      ),
  });

  const postFromDB = await db.query.posts.findFirst({
    where: (post, { or, eq, isNull, and }) =>
      and(
        eq(post.id, params.post_id),
        isNull(post.deleted_at),

        currentUserInDB.id !== userOfPost.id
          ? or(
              eq(post.type, "all"),
              currentUserInDB.program_id === userOfPost.program_id
                ? eq(post.type, "program")
                : undefined,

              currentUserInDB.program!.college_id ===
                userOfPost.program!.college_id
                ? eq(post.type, "college")
                : undefined,

              currentUserInDB.program!.college.campus_id ===
                userOfPost.program!.college.campus_id
                ? eq(post.type, "campus")
                : undefined,

              isFollower ? eq(post.type, "following") : undefined,
            )
          : undefined,
      ),
  });

  if (!postFromDB) notFound();

  return {
    title: `${postFromDB.content} - @${params.username}`,
  };
}

export default function PostPage({
  params: { post_id },
}: {
  params: { post_id: string };
}) {
  return (
    <>
      {/* <UpdatePost open={openUpdate} setOpen={setOpenUpdate} post={post} /> */}
      {/* <DeletePost open={openDelete} setOpen={setOpenDelete} post_id={post.id} /> */}

      <PostPageComponent post_id={post_id} />
    </>
  );
}
