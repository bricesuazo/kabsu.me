import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const nglRouter = router({
  getUser: publicProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("id, name, username, image_name, is_ngl_displayed")
        .eq("username", input.username)
        .is("banned_at", null)
        .is("deactivated_at", null)
        .single();

      if (!user) return null;

      let image_url: string | null = null;
      if (user.image_name && !user.image_name.startsWith("https://")) {
        const { data } = await ctx.supabase.storage
          .from("users")
          .createSignedUrl(
            user.id + "/avatar/" + user.image_name,
            60 * 60 * 24,
          );
        if (data) {
          image_url = data.signedUrl;
        }
      }

      return user.image_name?.startsWith("https://")
        ? { ...user, image_url: user.image_name }
        : user.image_name && image_url
          ? { ...user, image_url }
          : { ...user, image_name: null };
    }),
  sendMessage: publicProcedure
    .input(
      z.object({
        content: z.string(),
        code_name: z.string().optional(),
        user_id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: message, error: error_message } = await ctx.supabase
        .from("ngl_questions")
        .insert({
          user_id: input.user_id,
          content: input.content,
          code_name: input.code_name,
        })
        .select("id, user_id")
        .single();

      if (error_message)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
        });

      await Promise.all([
        (async () => {
          const channel = ctx.supabase.channel(
            "notifications." + message.user_id,
          );
          await channel.send({
            type: "broadcast",
            event: "ngl",
            payload: { ngl_question_id: message.id },
          });
          await ctx.supabase.removeChannel(channel);
        })(),
        ctx.supabase.from("notifications").insert({
          type: "ngl",
          to_id: message.user_id,
          from_id: message.user_id,
          ngl_question_id: message.id,
        }),
      ]);
    }),
  getAllMessages: publicProcedure
    .input(
      z.object({
        user_id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data: messages, error: error_messages } = await ctx.supabase
        .from("ngl_questions")
        .select(
          "id, content, code_name, created_at, answers:ngl_answers(id, content, created_at)",
        )
        .eq("user_id", input.user_id)
        .is("deleted_at", null);

      if (error_messages)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get messages",
        });

      return messages
        .filter((message) => message.answers.length !== 0)
        .sort((a, b) =>
          (b.answers[0]?.created_at ?? "").localeCompare(
            a.answers[0]?.created_at ?? "",
          ),
        );
    }),
  getAllMyMessages: protectedProcedure
    .input(z.object({ tab: z.enum(["messages", "replied"]) }))
    .query(async ({ ctx, input }) => {
      const { data: messages, error: error_messages } = await ctx.supabase
        .from("ngl_questions")
        .select(
          "id, content, code_name, created_at, answers:ngl_answers(id, content, created_at)",
        )
        .eq("user_id", ctx.auth.user.id)
        .order("created_at", { ascending: false })
        .is("deleted_at", null);

      if (error_messages)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get messages",
        });

      return messages
        .filter((message) =>
          input.tab === "messages"
            ? message.answers.length === 0
            : message.answers.length !== 0,
        )
        .sort((a, b) =>
          (b.answers[0]?.created_at ?? "").localeCompare(
            a.answers[0]?.created_at ?? "",
          ),
        );
    }),
  answerMessage: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        question_id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: answer, error: error_answer } = await ctx.supabase
        .from("ngl_answers")
        .insert({
          question_id: input.question_id,
          content: input.content,
        })
        .select("question:ngl_questions(user:users(username))")
        .single();

      if (error_answer || !answer.question?.user)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to answer message",
        });

      const channel = ctx.supabase.channel(
        "ngl." + answer.question.user.username,
      );
      await channel.send({
        type: "broadcast",
        event: "reply",
        payload: {},
      });
      await ctx.supabase.removeChannel(channel);
    }),
  deleteMessages: protectedProcedure
    .input(
      z.object({
        question_id: z.string().uuid().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all([
        input.question_id.map(async (id) => {
          const { error: error_question } = await ctx.supabase
            .from("ngl_questions")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", id);

          if (error_question)
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to archive message",
            });
        }),
      ]);
    }),
});
