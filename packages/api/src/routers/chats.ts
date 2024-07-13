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

    const image_urls: {
      error: string | null;
      path: string | null;
      signedUrl: string;
    }[] = [];

    const { data } = await ctx.supabase.storage
      .from("users")
      .createSignedUrls(
        [
          ...new Set(
            (rooms ?? []).flatMap((room) =>
              room.rooms_users
                .filter((user) => !user.users?.image_name?.startsWith("https:"))
                .map((user) =>
                  user.users?.image_name &&
                  !user.users.image_name.startsWith("https:")
                    ? user.users.id + "/avatar/" + user.users.image_name
                    : "",
                ),
            ),
          ),
        ],
        60 * 60 * 24,
      );

    if (data !== null) {
      image_urls.push(...data);
    }

    return (rooms ?? []).map((room) => ({
      ...room,
      rooms_users: room.rooms_users.map((user) => {
        const signed_url = image_urls.find(
          (url) =>
            url.path === user.users?.id + "/avatar/" + user.users?.image_name,
        );
        return {
          ...user,
          users: {
            id: user.users?.id,
            username: user.users?.username,
            ...(user.users?.image_name?.startsWith("https:")
              ? {
                  image_name: user.users.image_name,
                  image_url: user.users.image_name,
                }
              : user.users?.image_name && signed_url
                ? {
                    image_name: user.users.image_name,
                    image_url: signed_url.signedUrl,
                  }
                : {
                    image_name: null,
                  }),
          },
        };
      }),
    }));
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
          "*, chats(id, content, user_id, users(image_name), created_at), rooms_users!inner(user_id, users(id, username, image_name))",
        )
        .eq("id", input.room_id)
        .neq("rooms_users.user_id", ctx.auth.user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true, referencedTable: "chats" })
        .single();

      if (!room?.rooms_users[0]?.users) return null;

      const image_urls: {
        error: string | null;
        path: string | null;
        signedUrl: string;
      }[] = [];

      const { data } = await ctx.supabase.storage
        .from("users")
        .createSignedUrls(
          room.rooms_users[0]?.users?.image_name &&
            !room.rooms_users[0].users.image_name.startsWith("https:")
            ? [
                ...new Set([
                  ...room.chats
                    .filter(
                      (message) =>
                        !message.users?.image_name?.startsWith("https://") &&
                        message.user_id !== ctx.auth.user.id,
                    )
                    .map(
                      (message) =>
                        message.user_id +
                        "/avatar/" +
                        message.users?.image_name,
                    ),
                  room.rooms_users[0].user_id +
                    "/avatar/" +
                    room.rooms_users[0].users.image_name,
                ]),
              ]
            : [
                ...new Set(
                  room.chats
                    .filter(
                      (message) =>
                        !message.users?.image_name?.startsWith("https://") &&
                        message.user_id !== ctx.auth.user.id,
                    )
                    .map(
                      (message) =>
                        message.user_id +
                        "/avatar/" +
                        message.users?.image_name,
                    ),
                ),
              ],
          60 * 60 * 24,
        );

      if (data !== null) {
        image_urls.push(...data);
      }

      const to_signed_url = image_urls.find(
        (url) =>
          url.path ===
          room.rooms_users[0]?.user_id +
            "/avatar/" +
            room.rooms_users[0]?.users?.image_name,
      );

      return {
        id: room.id,
        to: room.rooms_users[0].users.image_name?.startsWith("https://")
          ? {
              id: room.rooms_users[0].user_id,
              username: room.rooms_users[0].users.username,
              image_name: room.rooms_users[0].users.image_name,
              image_url: room.rooms_users[0].users.image_name,
            }
          : room.rooms_users[0].users.image_name && to_signed_url
            ? {
                id: room.rooms_users[0].user_id,
                username: room.rooms_users[0].users.username,
                image_name: room.rooms_users[0].users.image_name,
                image_url: to_signed_url.signedUrl,
              }
            : {
                id: room.rooms_users[0].user_id,
                username: room.rooms_users[0].users.username,
                image_name: null,
              },

        chats: room.chats.map((message) => {
          const signed_url = image_urls.find(
            (url) =>
              url.path ===
              message.user_id + "/avatar/" + message.users?.image_name,
          );
          return {
            id: message.id,
            content: message.content,
            created_at: message.created_at,
            user_id: message.user_id,
            user: message.users?.image_name?.startsWith("https://")
              ? {
                  image_name: message.users.image_name,
                  image_url: message.users.image_name,
                }
              : message.users?.image_name && signed_url
                ? {
                    image_name: message.users.image_name,
                    image_url: signed_url.signedUrl,
                  }
                : {
                    image_name: null,
                  },
          };
        }),
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
        const { data: user } = await ctx.supabase
          .from("users")
          .select("program_id, programs(college_id, colleges(campus_id))")
          .eq("id", ctx.auth.user.id)
          .single();

        if (!user?.programs?.colleges)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const default_insert = {
          content: input.content,
          user_id: ctx.auth.user.id,
          type: input.type,
          reply_id: input.reply_id,
        };
        await ctx.supabase.from("global_chats").insert(
          input.type === "campus"
            ? {
                ...default_insert,
                campus_id: user.programs.colleges.campus_id,
              }
            : input.type === "college"
              ? {
                  ...default_insert,
                  college_id: user.programs.college_id,
                }
              : input.type === "program"
                ? {
                    ...default_insert,
                    program_id: user.program_id,
                  }
                : default_insert,
        );
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
        .select("*, rooms_users!inner(*)")
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
        .select("*, rooms_users!inner(*)")
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
        .select(
          "image_name, program_id, programs(college_id, colleges(campus_id))",
        )
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
          "*, users!inner(image_name, program_id, programs!inner(college_id, colleges!inner(campus_id)))",
        )
        .eq("type", input.type)
        .order("created_at")
        .is("deleted_at", null);

      if (input.type === "campus") {
        query = query.eq("campus_id", user.programs.colleges.campus_id);
      } else if (input.type === "college") {
        query = query.eq("college_id", user.programs.college_id);
      } else if (input.type === "program") {
        query = query.eq("program_id", user.program_id);
      }

      const { data: messages } = await query;

      const image_urls: {
        error: string | null;
        path: string | null;
        signedUrl: string;
      }[] = [];
      const { data } = await ctx.supabase.storage
        .from("users")
        .createSignedUrls(
          [
            ...new Set(
              (messages ?? [])
                .filter(
                  (message) =>
                    !message.users.image_name?.startsWith("https://") &&
                    message.user_id !== ctx.auth.user.id,
                )
                .map(
                  (message) =>
                    message.user_id + "/avatar/" + message.users.image_name,
                ),
            ),
          ],
          60 * 60 * 24,
        );

      if (data !== null) {
        image_urls.push(...data);
      }

      return (messages ?? []).map((message) => {
        const signed_url = image_urls.find(
          (url) =>
            url.path ===
            message.user_id + "/avatar/" + message.users.image_name,
        );
        return {
          id: message.id,
          content: message.content,
          created_at: message.created_at,
          user_id: message.user_id,
          user: message.users.image_name?.startsWith("https://")
            ? {
                image_name: message.users.image_name,
                image_url: message.users.image_name,
              }
            : message.users.image_name && signed_url
              ? {
                  image_name: message.users.image_name,
                  image_url: signed_url.signedUrl,
                }
              : {
                  image_name: null,
                },
        };
      });
    }),
});
