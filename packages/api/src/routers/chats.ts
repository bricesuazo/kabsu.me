import { TRPCError } from "@trpc/server";

import { protectedProcedure, router } from "../trpc";

export const chatsRouter = router({
  getAllRooms: protectedProcedure.query(async ({ ctx }) => {
    const { data: users } = await ctx.supabase
      .from("rooms_users")
      .select()
      .eq("user_id", ctx.auth.user.id);

    if (!users)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });

    const { data: rooms } = await ctx.supabase
      .from("rooms")
      .select("*, rooms_users(users(id, username, image_name))")
      .in("id", [...new Set(users.map((u) => u.room_id))])
      .is("deleted_at", null)
      .neq("rooms_users.user_id", ctx.auth.user.id);

    return rooms ?? [];

    // let image_url: string | null = null;
    // if (user.image_name && !user.image_name.startsWith("https://")) {
    //   const { data } = await ctx.supabase.storage
    //     .from("users")
    //     .createSignedUrl(user.id + "/avatar/" + user.image_name, 60 * 60 * 24);
    //   if (data) {
    //     image_url = data.signedUrl;
    //   }
    // }
    // return user.image_name?.startsWith("https://")
    //   ? {
    //       ...user,
    //       image_url: user.image_name,
    //     }
    //   : user.image_name && image_url
    //     ? { ...user, image_url }
    //     : { ...user, image_name: null };
  }),
});
