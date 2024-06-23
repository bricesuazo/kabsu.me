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
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session) notFound();

  const supabaseAdmin = createClientAdmin();

  const { data: current_user_in_db } = await supabaseAdmin
    .from("users")
    .select("*, program:programs(*, college:colleges(*, campus:campuses(*)))")
    .eq("id", session.user.id)
    .single();

  if (!current_user_in_db) notFound();

  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("user_id")
    .eq("id", params.post_id)
    .is("deleted_at", null)
    .single();

  if (!post) notFound();

  const { data: user_of_post } = await supabaseAdmin
    .from("users")
    .select(`*, program:programs(*, college:colleges(*, campus:campuses(*)))`)
    .eq("id", post.user_id)
    .single();

  if (!user_of_post) notFound();

  const { data: is_follower } = await supabaseAdmin
    .from("followers")
    .select()
    .eq("follower_id", session.user.id)
    .eq("followee_id", user_of_post.id)
    .single();

  const default_query = supabaseAdmin
    .from("posts")
    .select()
    .eq("id", params.post_id)
    .is("deleted_at", null);

  const { data: post_from_db } = await (
    current_user_in_db.id !== user_of_post.id
      ? default_query.eq("type", "all")
      : current_user_in_db.program_id === user_of_post.program_id
        ? default_query.eq("type", "program")
        : current_user_in_db.program[0]?.college_id ===
            user_of_post.program[0]?.college_id
          ? default_query.eq("type", "college")
          : current_user_in_db.program[0]?.college?.campus_id ===
              user_of_post.program[0]?.college?.campus_id
            ? default_query.eq("type", "campus")
            : is_follower
              ? default_query.eq("type", "following")
              : default_query
  ).single();

  if (!post_from_db) notFound();

  return {
    title: `${post_from_db.content} - @${params.username}`,
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
