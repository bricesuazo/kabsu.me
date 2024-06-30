import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient as createClientAdmin } from "~/supabase/admin";
import { createClient as createClientServer } from "~/supabase/server";
import PostPageComponent from "./post-page";

export async function generateMetadata({
  params,
}: {
  params: { username: string; post_id: string };
}): Promise<Metadata> {
  const supabaseServer = createClientServer();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) notFound();

  const supabaseAdmin = createClientAdmin();

  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("content, type, user_id")
    .eq("id", params.post_id)
    .is("deleted_at", null)
    .single();

  if (!post) notFound();

  if ((post.user_id !== user.id && post.type) === "following") {
    const { data: is_follower } = await supabaseAdmin
      .from("followers")
      .select()
      .eq("follower_id", user.id)
      .eq("followee_id", post.user_id)
      .single();

    if (!is_follower) notFound();
  }

  const { data: current_user_in_db } = await supabaseAdmin
    .from("users")
    .select("*, programs(*, colleges(*))")
    .eq("id", user.id)
    .single();

  if (!current_user_in_db) notFound();

  const { data: user_of_post } = await supabaseAdmin
    .from("users")
    .select(`*, programs(*, colleges(*))`)
    .eq("id", post.user_id)
    .single();

  if (!user_of_post) notFound();

  if (
    post.type === "program" &&
    current_user_in_db.program_id !== user_of_post.program_id
  )
    notFound();

  if (
    post.type === "college" &&
    current_user_in_db.programs?.college_id !==
      user_of_post.programs?.college_id
  )
    notFound();

  if (
    post.type === "campus" &&
    current_user_in_db.programs?.colleges?.campus_id !==
      user_of_post.programs?.colleges?.campus_id
  )
    notFound();

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
      {/* <UpdatePost open={openUpdate} setOpen={setOpenUpdate} post={post} /> */}
      {/* <DeletePost open={openDelete} setOpen={setOpenDelete} post_id={post.id} /> */}

      <PostPageComponent post_id={post_id} />
    </>
  );
}
