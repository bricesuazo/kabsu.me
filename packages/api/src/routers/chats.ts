import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { Database } from "../../../../supabase/types";
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

      if (!room) return null;

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
      z
        .object({
          type: z.literal("room"),
          room_id: z.string().uuid(),
          content: z.string().min(1),
          reply_id: z.string().optional(),
        })
        .or(
          z.object({
            type: z.enum(["all", "campus", "college", "program"]),
            content: z.string().min(1),
            reply_id: z.string().optional(),
          }),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.type === "room") {
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

        await ctx.supabase.from("chats").insert({
          room_id: room.id,
          user_id: ctx.auth.user.id,
          content: input.content,
          reply_id: input.reply_id,
        });
      } else {
        await ctx.supabase.from("global_chats").insert({
          content: input.content,
          user_id: ctx.auth.user.id,
          type: input.type,
          reply_id: input.reply_id,
        });
      }
    }),
  getOrCreateRoom: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: users } = await ctx.supabase
        .from("rooms_users")
        .select()
        .eq("user_id", ctx.auth.user.id);

      if (!users)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });

      const { data: room } = await ctx.supabase
        .from("rooms")
        .select("*, rooms_users(*)")
        .in("id", [...new Set(users.map((u) => u.room_id))])
        .eq("rooms_users.user_id", input.user_id)
        .is("deleted_at", null)
        .maybeSingle();

      if (room?.id) return { room_id: room.id };

      const { data: user } = await ctx.supabase
        .from("users")
        .select("id, username")
        .eq("id", input.user_id)
        .single();
      return { user };
    }),
  sendNewMessage: protectedProcedure
    .input(
      z.object({
        user_id: z.string().uuid(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data: my_rooms } = await ctx.supabase
        .from("rooms_users")
        .select()
        .eq("user_id", ctx.auth.user.id);

      if (!my_rooms)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });

      const { data: is_room_exists } = await ctx.supabase
        .from("rooms")
        .select("*, rooms_users(*)")
        .in("id", [...new Set(my_rooms.map((u) => u.room_id))])
        .eq("rooms_users.user_id", input.user_id)
        .is("deleted_at", null)
        .maybeSingle();

      if (is_room_exists)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `room_${is_room_exists.id}`,
        });

      const { data: is_user_exists } = await ctx.supabase
        .from("users")
        .select()
        .eq("id", input.user_id)
        .single();

      if (!is_user_exists)
        throw new TRPCError({ code: "NOT_FOUND", message: "user_not_found" });

      const { data: new_room, error: new_room_error } = await ctx.supabase
        .from("rooms")
        .insert({})
        .select("id")
        .single();

      if (new_room_error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: new_room_error.message,
        });

      await ctx.supabase.from("rooms_users").insert([
        { room_id: new_room.id, user_id: ctx.auth.user.id },
        { room_id: new_room.id, user_id: input.user_id },
      ]);
      await ctx.supabase.from("chats").insert({
        user_id: ctx.auth.user.id,
        room_id: new_room.id,
        content: input.content,
      });

      return { room_id: new_room.id };
    }),
  getGlobalChatMessages: protectedProcedure
    .input(
      z.object({
        type: z.custom<Database["public"]["Enums"]["global_chat_type"]>(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("program_id, programs(college_id, colleges(campus_id))")
        .eq("id", ctx.auth.user.id)
        .single();

      if (!user?.programs?.colleges)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });

      let query = ctx.supabase
        .from("global_chats")
        .select(
          "*, users(program_id, programs(college_id, colleges(campus_id)))",
        )
        .eq("type", input.type)
        .order("created_at")
        .is("deleted_at", null);

      if (input.type === "campus") {
        query = query.eq(
          "users.programs.colleges.campus_id",
          user.programs.colleges.campus_id,
        );
      } else if (input.type === "college") {
        query = query.eq("users.programs.college_id", user.programs.college_id);
      } else if (input.type === "program") {
        query = query.eq("users.program_id", user.program_id);
      }

      const { data: messages, error } = await query;
      console.log("🚀 ~ .query ~ error:", error);

      return (messages ?? []).map((message) => ({
        id: message.id,
        content: message.content,
        created_at: message.created_at,
        is_me: message.user_id === ctx.auth.user.id,
      }));
    }),
});
