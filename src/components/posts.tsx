import { db } from "@/db";
import Post from "./post";
import { auth, clerkClient } from "@clerk/nextjs";
import type {
  College,
  Followee,
  Follower,
  Post as PostType,
  User,
} from "@/db/schema";
import { notFound } from "next/navigation";

export default async function Posts({
  tab,
}: {
  tab?: "all" | "program" | "college";
}) {
  const { userId } = auth();

  if (!userId) notFound();

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
    orderBy: (post, { desc }) => desc(post.created_at),
    with: {
      programs: true,
    },
  });

  if (!user) notFound();

  const following: Follower[] = !tab
    ? await db.query.followers.findMany({
        where: (follower, { eq }) => eq(follower.follower_id, userId),
      })
    : [];

  const usersInPrograms: User[] =
    tab === "program"
      ? await db.query.users.findMany({
          where: (userInDB, { eq }) => eq(userInDB.program_id, user.program_id),
        })
      : [];

  // TODO: optimize this
  const myCollege = await db.query.programs.findFirst({
    where: (program, { eq }) => eq(program.id, user.program_id),
    with: {
      college: true,
    },
  });

  if (!myCollege) notFound();

  const colleges = await db.query.programs.findMany({
    where: (program, { eq }) => eq(program.college_id, myCollege.college_id),
  });

  const usersInColleges: User[] =
    tab === "college" && colleges.length > 0
      ? await db.query.users.findMany({
          where: (userInDB, { inArray }) =>
            inArray(
              userInDB.program_id,
              colleges.map((c) => c.id),
            ),
        })
      : [];

  const posts = await db.query.posts.findMany({
    where: (post, { or, and, eq, isNull, inArray }) => {
      if (!tab) {
        console.log("🚀 ~ file: posts.tsx:71 ~ following:", following);
        return and(
          isNull(post.deleted_at),
          or(
            following.length > 0
              ? inArray(
                  post.user_id,
                  following.map((f) => f.followee_id),
                )
              : undefined,
            eq(post.user_id, userId),
          ),
        );
      }

      if (tab === "program") {
        return or(
          and(
            isNull(post.deleted_at),
            usersInPrograms.length > 0
              ? inArray(
                  post.user_id,
                  usersInPrograms.map((f) => f.id),
                )
              : undefined,
          ),
          eq(post.user_id, userId),
        );
      }

      if (tab === "college") {
        return or(
          and(
            isNull(post.deleted_at),
            usersInPrograms.length > 0
              ? inArray(
                  post.user_id,
                  usersInColleges.map((f) => f.id),
                )
              : undefined,
          ),
          eq(post.user_id, userId),
        );
      }

      if (tab === "all") return isNull(post.deleted_at);
    },
    orderBy: (post, { desc }) => desc(post.created_at),
    with: {
      user: true,
    },
  });

  const usersFromPosts = await clerkClient.users.getUserList({
    userId: posts.map((post) => post.user && post.user.id),
  });

  return (
    <div className="flex flex-col">
      {posts.map((post) => {
        if (!post.user) return null;
        return (
          <Post
            key={post.id}
            post={{
              ...post,
              user: {
                ...usersFromPosts.find((user) => user.id === post.user.id)!,
              },
            }}
            isMyPost={post.user.id === userId}
          />
        );
      })}
    </div>
  );
}
