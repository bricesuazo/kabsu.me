import type { RealtimeChannel } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";

import type { Database } from "../../../../supabase/types";
import { env } from "../../../../apps/www/src/env";
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

    return (rooms ?? [])
      .map((room) => ({
        ...room,
        rooms_users: room.rooms_users.map((user) => {
          let avatar_url: string | null = null;

          if (
            user.users?.image_name &&
            !user.users.image_name.startsWith("https:")
          ) {
            avatar_url = ctx.supabase.storage
              .from("avatars")
              .getPublicUrl(
                "users/" + user.users.id + "/" + user.users.image_name,
              ).data.publicUrl;
          }

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
                : user.users?.image_name && avatar_url
                  ? {
                      image_name: user.users.image_name,
                      image_url: avatar_url,
                    }
                  : {
                      image_name: null,
                    }),
            },
          };
        }),
      }))
      .sort(
        (a, b) =>
          new Date(b.chats[0]?.created_at ?? "").getTime() -
          new Date(a.chats[0]?.created_at ?? "").getTime(),
      );
  }),
  sendMessage: protectedProcedure
    .input(
      z
        .object({
          id: z.string().uuid(),
          type: z.literal("room"),
          room_id: z.string().uuid(),
          content: z.string().min(1),
          reply_id: z.string().optional(),
        })
        .or(
          z.object({
            id: z.string().uuid(),
            type: z.enum(["all", "campus", "college", "program"]),
            content: z.string().min(1),
            reply_id: z.string().optional(),
          }),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const rate_limiter = new Ratelimit({
        redis: ctx.redis,
        limiter: Ratelimit.slidingWindow(5, "10 s"),
      });

      if (env.NODE_ENV !== "development") {
        const { success } = await rate_limiter.limit(ctx.auth.user.id);

        if (!success) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "You are sending messages too fast. Try again later.",
          });
        }
      }

      let channel: RealtimeChannel | undefined = undefined;
      let channel_notification: RealtimeChannel | undefined = undefined;
      if (input.type === "room") {
        const { data: room } = await ctx.supabase
          .from("rooms")
          .select("*, rooms_users(user_id, user:users(username))")
          .eq("id", input.room_id)
          .is("deleted_at", null)
          .single();

        if (!room)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Room not found",
          });

        const { data: chat } = await ctx.supabase
          .from("chats")
          .insert({
            id: input.id,
            room_id: room.id,
            user_id: ctx.auth.user.id,
            content: input.content,
            reply_id: input.reply_id,
          })
          .select(
            "id, content, user_id, created_at, users(name, username, image_name), reply:chats(id, content, user_id, users(name, username))",
          )
          .single();

        if (!chat)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to insert chat",
          });

        let signed_url: string | null = null;

        if (
          chat.users?.image_name &&
          !chat.users.image_name.startsWith("https:")
        ) {
          const { data } = ctx.supabase.storage
            .from("avatars")
            .getPublicUrl(
              "users/" + chat.user_id + "/" + chat.users.image_name,
            );
          signed_url = data.publicUrl;
        }

        channel = ctx.supabase.channel(`chat_${input.type}_${input.room_id}`);

        channel_notification = ctx.supabase.channel(
          `notifications.${
            room.rooms_users.find((user) => user.user_id !== ctx.auth.user.id)
              ?.user_id
          }`,
        );

        await Promise.all([
          channel.send({
            type: "broadcast",
            event: "new",
            payload: {
              id: chat.id,
              content: chat.content,
              created_at: chat.created_at,
              user_id: chat.user_id,
              reply: chat.reply,
              user: {
                name: chat.users?.name ?? "",
                username: chat.users?.username ?? "",
                ...(chat.users?.image_name?.startsWith("https://")
                  ? {
                      image_name: chat.users.image_name,
                      image_url: chat.users.image_name,
                    }
                  : chat.users?.image_name && signed_url
                    ? {
                        image_name: chat.users.image_name,
                        image_url: signed_url,
                      }
                    : {
                        image_name: null,
                      }),
              },
            },
          }),
          channel_notification.send({
            type: "broadcast",
            event: "message_new",
            payload: {
              room_id: input.room_id,
              from_username: room.rooms_users.find(
                (user) => user.user_id === ctx.auth.user.id,
              )?.user?.username,
            },
          }),
        ]);
      } else {
        const { data: user } = await ctx.supabase
          .from("users")
          .select("program_id, programs(college_id, colleges(campus_id))")
          .eq("id", ctx.auth.user.id)
          .single();

        if (!user?.programs?.colleges)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const default_insert = {
          id: input.id,
          content: input.content,
          user_id: ctx.auth.user.id,
          type: input.type,
          reply_id: input.reply_id,
        };
        const { data: chat } = await ctx.supabase
          .from("global_chats")
          .insert(
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
          )
          .select(
            "id, content, user_id, created_at, users(name, username, image_name), reply:global_chats(id, content, user_id, users(name, username))",
          )
          .single();

        if (!chat)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to insert chat",
          });

        let signed_url: string | null = null;

        if (
          chat.users?.image_name &&
          !chat.users.image_name.startsWith("https:")
        ) {
          const { data } = ctx.supabase.storage
            .from("avatars")
            .getPublicUrl(
              "users/" + chat.user_id + "/" + chat.users.image_name,
            );
          signed_url = data.publicUrl;
        }

        channel = ctx.supabase.channel(
          `chat_${input.type}_${input.type === "all" ? "all" : input.type === "campus" ? user.programs.colleges.campus_id : input.type === "college" ? user.programs.college_id : user.program_id}`,
        );
        await channel.send({
          type: "broadcast",
          event: "new",
          payload: {
            id: chat.id,
            content: chat.content,
            created_at: chat.created_at,
            user_id: chat.user_id,
            reply: chat.reply,
            user: {
              name: chat.users?.name ?? "",
              username: chat.users?.username ?? "",
              ...(chat.users?.image_name?.startsWith("https://")
                ? {
                    image_name: chat.users.image_name,
                    image_url: chat.users.image_name,
                  }
                : chat.users?.image_name && signed_url
                  ? {
                      image_name: chat.users.image_name,
                      image_url: signed_url,
                    }
                  : {
                      image_name: null,
                    }),
            },
          },
        });
      }

      await Promise.all([
        ctx.supabase.removeChannel(channel),
        channel_notification &&
          ctx.supabase.removeChannel(channel_notification),
      ]);

      return { id: input.id };
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
  getRoomChats: protectedProcedure
    .input(
      z.object({ type: z.literal("room"), room_id: z.string().uuid() }).or(
        z.object({
          type: z.custom<Database["public"]["Enums"]["global_chat_type"]>(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const limit = 20;

      if (input.type === "room") {
        const { data: room } = await ctx.supabase
          .from("rooms")
          .select(
            "*, chats!inner(id, content, user_id, created_at, reply_id, users(name, username, image_name)), rooms_users!inner(user_id, users(id, username, image_name, name, type, followers!followee_id (*), followees!follower_id (*)))",
          )
          .eq("id", input.room_id)
          .neq("rooms_users.user_id", ctx.auth.user.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false, referencedTable: "chats" })
          .limit(limit, { referencedTable: "chats" })
          .single();

        if (!room?.rooms_users[0]?.users) return null;

        const { data: replies } = await ctx.supabase
          .from("chats")
          .select("id, content")
          .in(
            "id",
            room.chats
              .filter((message) => message.reply_id)
              .map((chat) => chat.reply_id),
          );

        let to_image_url: string | null = null;

        if (
          room.rooms_users[0].users.image_name &&
          !room.rooms_users[0].users.image_name.startsWith("https:")
        ) {
          const { data } = ctx.supabase.storage
            .from("avatars")
            .getPublicUrl(
              "users/" +
                room.rooms_users[0].user_id +
                "/" +
                room.rooms_users[0].users.image_name,
            );

          to_image_url = data.publicUrl;
        }

        return {
          type: input.type,
          room: {
            id: room.id,
            to: {
              id: room.rooms_users[0].user_id,
              username: room.rooms_users[0].users.username,
              name: room.rooms_users[0].users.name,
              type: room.rooms_users[0].users.type,
              followers_length: room.rooms_users[0].users.followers.length,
              followees_length: room.rooms_users[0].users.followees.length,
              ...(room.rooms_users[0].users.image_name?.startsWith("https://")
                ? {
                    image_name: room.rooms_users[0].users.image_name,
                    image_url: room.rooms_users[0].users.image_name,
                  }
                : room.rooms_users[0].users.image_name && to_image_url
                  ? {
                      image_name: room.rooms_users[0].users.image_name,
                      image_url: to_image_url,
                    }
                  : {
                      image_name: null,
                    }),
            },
            chats: room.chats
              .sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime(),
              )
              .map((message) => {
                // const signed_url = image_urls.find(
                //   (url) =>
                //     url.path ===
                //     message.user_id + "/avatar/" + message.users?.image_name,
                // );

                let image_url: string | null = null;

                if (
                  message.users?.image_name &&
                  !message.users.image_name.startsWith("https:")
                ) {
                  const { data } = ctx.supabase.storage
                    .from("avatars")
                    .getPublicUrl(
                      "users/" +
                        message.user_id +
                        "/" +
                        message.users.image_name,
                    );

                  image_url = data.publicUrl;
                }

                return {
                  id: message.id,
                  content: message.content,
                  created_at: message.created_at,
                  user_id: message.user_id,
                  reply:
                    replies?.find((reply) => reply.id === message.reply_id) ??
                    null,
                  user: {
                    name: message.users?.name ?? "",
                    username: message.users?.username ?? "",
                    ...(message.users?.image_name?.startsWith("https://")
                      ? {
                          image_name: message.users.image_name,
                          image_url: message.users.image_name,
                        }
                      : message.users?.image_name && image_url
                        ? {
                            image_name: message.users.image_name,
                            image_url: image_url,
                          }
                        : {
                            image_name: null,
                          }),
                  },
                };
              }),
          },
        };
      } else {
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
            "*, users!inner(name, username, image_name, program_id, programs!inner(college_id, colleges!inner(campus_id)))",
          )
          .eq("type", input.type)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (input.type === "campus") {
          query = query.eq("campus_id", user.programs.colleges.campus_id);
        } else if (input.type === "college") {
          query = query.eq("college_id", user.programs.college_id);
        } else if (input.type === "program") {
          query = query.eq("program_id", user.program_id);
        }

        const { data: messages, error } = await query;

        if (error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });

        const { data: replies } = await ctx.supabase
          .from("global_chats")
          .select("id, content")
          .in(
            "id",
            messages
              .filter((message) => message.reply_id)
              .map((chat) => chat.reply_id),
          );

        return {
          type: input.type,
          room: {
            id: input.type,
            chats: messages
              .sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime(),
              )
              .map((message) => {
                let image_url: string | null = null;

                if (
                  message.users.image_name &&
                  !message.users.image_name.startsWith("https:")
                ) {
                  const { data } = ctx.supabase.storage
                    .from("avatars")
                    .getPublicUrl(
                      "users/" +
                        message.user_id +
                        "/" +
                        message.users.image_name,
                    );

                  image_url = data.publicUrl;
                }
                return {
                  id: message.id,
                  content: message.content,
                  created_at: message.created_at,
                  user_id: message.user_id,
                  reply:
                    replies?.find((reply) => reply.id === message.reply_id) ??
                    null,
                  user: {
                    name: message.users.name,
                    username: message.users.username,
                    ...(message.users.image_name?.startsWith("https://")
                      ? {
                          image_name: message.users.image_name,
                          image_url: message.users.image_name,
                        }
                      : message.users.image_name && image_url
                        ? {
                            image_name: message.users.image_name,
                            image_url,
                          }
                        : {
                            image_name: null,
                          }),
                  },
                };
              }),
          },
        };
      }
    }),
  loadMoreMessages: protectedProcedure
    .input(
      z.object({ len: z.number().default(0) }).and(
        z.object({ type: z.literal("room"), room_id: z.string().uuid() }).or(
          z.object({
            type: z.custom<Database["public"]["Enums"]["global_chat_type"]>(),
          }),
        ),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const limit = 20;

      if (input.type === "room") {
        const { data: room } = await ctx.supabase
          .from("rooms")
          .select(
            "*, chats(id, content, user_id, created_at, reply_id, users(name, username, image_name)), rooms_users!inner(user_id, users(id, username, image_name))",
          )
          .eq("id", input.room_id)
          .neq("rooms_users.user_id", ctx.auth.user.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false, referencedTable: "chats" })
          .limit(limit, { referencedTable: "chats" })
          .range(input.len, input.len + limit, {
            referencedTable: "chats",
          })
          .single();

        if (!room?.rooms_users[0]?.users) return null;

        const { data: replies } = await ctx.supabase
          .from("chats")
          .select("id, content")
          .in(
            "id",
            room.chats
              .filter((message) => message.reply_id)
              .map((chat) => chat.reply_id),
          );

        let to_image_url: string | null = null;

        if (
          room.rooms_users[0].users.image_name &&
          !room.rooms_users[0].users.image_name.startsWith("https:")
        ) {
          const { data } = ctx.supabase.storage
            .from("avatars")
            .getPublicUrl(
              "users/" +
                room.rooms_users[0].user_id +
                "/" +
                room.rooms_users[0].users.image_name,
            );

          to_image_url = data.publicUrl;
        }

        return {
          type: input.type,
          room: {
            id: room.id,
            to: {
              id: room.rooms_users[0].user_id,
              username: room.rooms_users[0].users.username,
              ...(room.rooms_users[0].users.image_name?.startsWith("https://")
                ? {
                    image_name: room.rooms_users[0].users.image_name,
                    image_url: room.rooms_users[0].users.image_name,
                  }
                : room.rooms_users[0].users.image_name && to_image_url
                  ? {
                      image_name: room.rooms_users[0].users.image_name,
                      image_url: to_image_url,
                    }
                  : {
                      image_name: null,
                    }),
            },
            chats: room.chats
              .sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime(),
              )
              .map((message) => {
                let image_url: string | null = null;

                if (
                  message.users?.image_name &&
                  !message.users.image_name.startsWith("https:")
                ) {
                  const { data } = ctx.supabase.storage
                    .from("avatars")
                    .getPublicUrl(
                      "users/" +
                        message.user_id +
                        "/" +
                        message.users.image_name,
                    );

                  image_url = data.publicUrl;
                }
                return {
                  id: message.id,
                  content: message.content,
                  created_at: message.created_at,
                  user_id: message.user_id,
                  reply:
                    replies?.find((reply) => reply.id === message.reply_id) ??
                    null,
                  user: {
                    name: message.users?.name ?? "",
                    username: message.users?.username ?? "",
                    ...(message.users?.image_name?.startsWith("https://")
                      ? {
                          image_name: message.users.image_name,
                          image_url: message.users.image_name,
                        }
                      : message.users?.image_name && image_url
                        ? {
                            image_name: message.users.image_name,
                            image_url,
                          }
                        : {
                            image_name: null,
                          }),
                  },
                };
              }),
          },
        };
      } else {
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
            "*, users!inner(name, username, image_name, program_id, programs!inner(college_id, colleges!inner(campus_id)))",
          )
          .eq("type", input.type)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(limit)
          .range(input.len, input.len + limit);

        if (input.type === "campus") {
          query = query.eq("campus_id", user.programs.colleges.campus_id);
        } else if (input.type === "college") {
          query = query.eq("college_id", user.programs.college_id);
        } else if (input.type === "program") {
          query = query.eq("program_id", user.program_id);
        }

        const { data: messages, error } = await query;

        if (error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });

        const { data: replies } = await ctx.supabase
          .from("global_chats")
          .select("id, content")
          .in(
            "id",
            messages
              .filter((message) => message.reply_id)
              .map((chat) => chat.reply_id),
          );

        return {
          type: input.type,
          room: {
            id: input.type,
            chats: messages
              .sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime(),
              )
              .map((message) => {
                let image_url: string | null = null;

                if (
                  message.users.image_name &&
                  !message.users.image_name.startsWith("https:")
                ) {
                  const { data } = ctx.supabase.storage
                    .from("avatars")
                    .getPublicUrl(
                      "users/" +
                        message.user_id +
                        "/" +
                        message.users.image_name,
                    );

                  image_url = data.publicUrl;
                }
                return {
                  id: message.id,
                  content: message.content,
                  created_at: message.created_at,
                  user_id: message.user_id,
                  reply:
                    replies?.find((reply) => reply.id === message.reply_id) ??
                    null,
                  user: {
                    name: message.users.name,
                    username: message.users.username,
                    ...(message.users.image_name?.startsWith("https://")
                      ? {
                          image_name: message.users.image_name,
                          image_url: message.users.image_name,
                        }
                      : message.users.image_name && image_url
                        ? {
                            image_name: message.users.image_name,
                            image_url,
                          }
                        : {
                            image_name: null,
                          }),
                  },
                };
              }),
          },
        };
      }
    }),
});
