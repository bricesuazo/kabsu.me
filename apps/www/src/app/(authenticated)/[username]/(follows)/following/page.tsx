import type { Metadata } from "next";
import { notFound } from "next/navigation";

import UserFollows from "~/components/user-follows";
import { createClient as createClientAdmin } from "~/supabase/admin";
import { createClient as createClientServer } from "~/supabase/server";

export function generateMetadata({
  params: { username },
}: {
  params: { username: string };
}): Metadata {
  return {
    title: `Followers - @${username}`,
  };
}

export default async function FollowingPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const supabaseServer = createClientServer();
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session) notFound();

  const supabaseAdmin = createClientAdmin();

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (!user) notFound();

  const { data: followees } = await supabaseAdmin
    .from("followees")
    .select("follower_id, created_at")
    .eq("followee_id", user.id)
    .order("created_at", { ascending: true });

  // TODO: This is a hacky way to get the followers of the user
  const { data: my_followers } = await supabaseAdmin
    .from("followers")
    .select("follower_id")
    .eq("followee_id", session.user.id);

  if (!followees || !my_followers) notFound();

  const followeesUsers =
    followees.length !== 0
      ? await supabaseAdmin
          .from("users")
          .select()
          .in(
            "id",
            followees.map((f) => f.follower_id),
          )
          .then(async (res) => {
            if (res.error) {
              console.error(res.error);
              return [];
            }

            const image_urls: {
              error: string | null;
              path: string | null;
              signedUrl: string;
            }[] = [];

            const { data } = await supabaseAdmin.storage
              .from("users")
              .createSignedUrls(
                res.data.map((user) => user.id + "/" + user.image_name),
                60 * 60 * 24,
              );
            if (data) {
              image_urls.push(...data);
            }

            return res.data.map((user) => {
              const image_url = image_urls.find(
                (image) => image.path === user.id + "/" + user.image_name,
              )?.signedUrl;
              return user.image_name && image_url
                ? {
                    ...user,
                    image_url,
                  }
                : { ...user, image_name: null };
            });
          })
      : [];

  return (
    <div>
      <p className="text-center text-sm text-muted-foreground">Following</p>
      <div>
        {followeesUsers.length === 0 ? (
          <p className="text-center">No following yet.</p>
        ) : (
          followees
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )
            .map((followee) => {
              const followee_user = followeesUsers.find(
                (user) => user.id === followee.follower_id,
              );

              if (!followee_user) return null;

              return (
                <UserFollows
                  key={followee_user.id}
                  user={followee_user}
                  isFollower={my_followers.some(
                    (follower) => follower.follower_id === followee_user.id,
                  )}
                />
              );
            })
        )}
      </div>
    </div>
  );
}
