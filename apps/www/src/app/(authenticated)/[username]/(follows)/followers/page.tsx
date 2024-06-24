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

export default async function FollowersPage({
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

  const { data: followers } = await supabaseAdmin
    .from("followers")
    .select("follower_id, created_at")
    .eq("followee_id", user.id)
    .order("created_at", { ascending: true });

  const { data: my_followees } = await supabaseAdmin
    .from("followees")
    .select("follower_id")
    .eq("followee_id", session.user.id);

  if (!followers || !my_followees) notFound();

  const followersUsers =
    followers.length !== 0
      ? await supabaseAdmin
          .from("users")
          .select()
          .in(
            "id",
            followers.map((f) => f.follower_id),
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
      <p className="text-center text-sm text-muted-foreground">Followers</p>
      {followersUsers.length === 0 ? (
        <p className="text-center">No followers yet.</p>
      ) : (
        followers
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
          .map((follower) => {
            const followerUser = followersUsers.find(
              (user) => user.id === follower.follower_id,
            );

            if (!followerUser) return null;

            return (
              <UserFollows
                key={followerUser.id}
                user={followerUser}
                isFollower={my_followees.some(
                  (followee) => followee.follower_id === followerUser.id,
                )}
              />
            );
          })
      )}
    </div>
  );
}
