import Post from "@/components/post";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { clerkClient } from "@clerk/nextjs";
import { isNull } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function UserPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const users = await clerkClient.users.getUserList({
    username: [username],
  });

  const user = users[0];

  if (!user) notFound();

  const posts = await db.query.posts.findMany({
    where: (post, { and, eq }) =>
      and(isNull(post.deleted_at), eq(post.user_id, user.id)),
    orderBy: (post, { asc }) => [asc(post.created_at)],
    with: {
      user: true,
    },
  });

  const usersFromPosts = await clerkClient.users.getUserList({
    userId: posts.map((post) => post.user.id),
  });

  const program = await db.query.programs.findFirst({
    where: (program, { eq }) =>
      eq(program.id, user.publicMetadata.program_id as string),
    with: {
      department: {
        with: {
          college: true,
        },
      },
    },
  });

  return (
    <div>
      {program && (
        <div className="flex items-center gap-x-2">
          <Badge>{program.department.college.slug.toUpperCase()}</Badge>
          <Badge variant="outline">
            {program.department.slug.toUpperCase()}
          </Badge>
          <Badge variant="outline">{program.slug.toUpperCase()}</Badge>
        </div>
      )}
      {posts.map((post) => (
        <Post
          key={post.id}
          post={{
            ...post,
            user: usersFromPosts.find((user) => user.id === post.user.id)!,
          }}
          userId={user.id}
        />
      ))}
    </div>
  );
}
