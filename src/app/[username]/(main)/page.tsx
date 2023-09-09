import Post from "@/components/post";
import { db } from "@/db";
import { auth, clerkClient } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateMetadata({
  params,
}: {
  params: { username: string };
}): Metadata {
  return {
    title: `@${params.username}`,
  };
}

export default async function UserPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const { userId } = auth();

  const users = await clerkClient.users.getUserList({
    username: [username],
  });

  const user = users[0];

  if (!user) notFound();

  const userFromDB = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, user.id),

    with: {
      program: { with: { college: true } },
    },
  });

  if (!userFromDB) notFound();

  const posts = await db.query.posts.findMany({
    where: (post, { and, eq, isNull }) =>
      and(isNull(post.deleted_at), eq(post.user_id, user.id)),
    orderBy: (post, { desc }) => desc(post.created_at),
    with: {
      user: {
        with: {
          program: {
            with: {
              college: {
                with: { campus: true },
              },
            },
          },
        },
      },
    },
  });

  const usersFromPosts = await clerkClient.users.getUserList({
    userId: posts.map((post) => post.user.id),
  });

  return (
    <div className="">
      {posts.length === 0 ? (
        <div>
          <div className="text-center">
            <div className="text-2xl font-semibold">No posts yet</div>
            <div className="mt-2 text-gray-500">
              When @{user.username} posts something, it will show up here.
            </div>
          </div>
        </div>
      ) : (
        posts.map((post) => (
          <Post
            key={post.id}
            post={{
              ...post,
              user: {
                ...usersFromPosts.find((user) => user.id === post.user.id)!,
                ...post.user,
              },
            }}
            isMyPost={userId === post.user.id}
          />
        ))
      )}
    </div>
  );
}
