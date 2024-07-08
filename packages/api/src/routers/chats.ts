import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
      .select(
        "*, rooms_users(users(id, username, image_name)), chats(content, created_at)",
      )
      .in("id", [...new Set(users.map((u) => u.room_id))])
      .order("created_at", { ascending: false, referencedTable: "chats" })
      .limit(1, { referencedTable: "chats" })
      .is("deleted_at", null)
      .neq("rooms_users.user_id", ctx.auth.user.id);

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

    return rooms ?? [];
  }),
  getRoom: protectedProcedure
    .input(
      z.object({
        room_id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data: room } = await ctx.supabase
        .from("rooms")
        .select(
          "*, chats(id, content, user_id, created_at), rooms_users(users(id, username, image_name))",
        )
        .eq("id", input.room_id)
        .neq("rooms_users.user_id", ctx.auth.user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true, referencedTable: "chats" })
        .single();

      if (!room)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });

      return {
        ...room,
        chats: room.chats.map((chat) => ({
          id: chat.id,
          content: chat.content,
          created_at: chat.created_at,
          is_me: chat.user_id === ctx.auth.user.id,
        })),
      };
    }),
  sendMessage: protectedProcedure
    .input(
      z.object({
        room_id: z.string().uuid(),
        content: z.string().min(1),
        reply_id: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: room } = await ctx.supabase
        .from("rooms")
        .select("*, rooms_users(user_id)")
        .eq("id", input.room_id)
        .eq("rooms_users.user_id", ctx.auth.user.id)
        .is("deleted_at", null)
        .single();

      if (!room)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });

      const { data: chat } = await ctx.supabase.from("chats").insert({
        room_id: room.id,
        user_id: ctx.auth.user.id,
        content: input.content,
        reply_id: input.reply_id,
      });

      return chat;
    }),
});
