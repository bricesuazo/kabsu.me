import RefreshPage from "@/components/RefreshPage";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostPageComponent from "./post-page";

export async function generateMetadata({
  params,
}: {
  params: { username: string; post_id: string };
}): Promise<Metadata> {
  const post = await db.query.posts.findFirst({
    where: (post, { eq }) => eq(post.id, params.post_id),
    with: {
      user: true,
    },
  });

  if (!post) notFound();

  return {
    title: `${post.content} - @${params.username}`,
  };
}

export default function PostPage({
  params: { post_id },
}: {
  params: { post_id: string };
}) {
  return (
    <>
      <RefreshPage />
      {/* <UpdatePost open={openUpdate} setOpen={setOpenUpdate} post={post} /> */}
      {/* <DeletePost open={openDelete} setOpen={setOpenDelete} post_id={post.id} /> */}

      <PostPageComponent post_id={post_id} />
    </>
  );
}
