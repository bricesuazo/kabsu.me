
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."global_chat_type" AS ENUM (
    'all',
    'campus',
    'college',
    'program'
);

ALTER TYPE "public"."global_chat_type" OWNER TO "postgres";

CREATE TYPE "public"."notification_type" AS ENUM (
    'like',
    'comment',
    'follow',
    'mention_post',
    'mention_comment',
    'strike_account',
    'strike_post',
    'reply'
);

ALTER TYPE "public"."notification_type" OWNER TO "postgres";

CREATE TYPE "public"."post_type" AS ENUM (
    'following',
    'program',
    'college',
    'campus',
    'all'
);

ALTER TYPE "public"."post_type" OWNER TO "postgres";

CREATE TYPE "public"."user_type" AS ENUM (
    'student',
    'faculty',
    'alumni'
);

ALTER TYPE "public"."user_type" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_user"("user_id" "uuid", "email" "text", "created_at" timestamp with time zone) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  declare
  encrypted_pw text;
BEGIN
  encrypted_pw := extensions.crypt(user_id::text, extensions.gen_salt('bf')::text);
  
  INSERT INTO auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', email, encrypted_pw, created_at, created_at, created_at, '{"provider":"email","providers":["email"]}', '{}', created_at, created_at, '', '', '', '');
  
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), user_id, user_id, format('{"sub":"%s","email":"%s"}', user_id::text, email)::jsonb, 'email', created_at, created_at, created_at);

  RETURN user_id;
END;
$$;

ALTER FUNCTION "public"."create_user"("user_id" "uuid", "email" "text", "created_at" timestamp with time zone) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_mention"("user_ids" "text"[]) RETURNS TABLE("id" "uuid", "username" "text", "name" "text")
    LANGUAGE "plpgsql"
    AS $$
declare
  user_id uuid;
  user_found boolean;
  user_id_str varchar;
begin
  -- Initialize an empty array to store results
  FOR user_id_str IN SELECT unnest(user_ids) LOOP
    -- Attempt to convert user_id_str to UUID
    BEGIN
      user_id := user_id_str::uuid;
    EXCEPTION
      WHEN others THEN
        -- Handle invalid UUID (skip or log error as needed)
        CONTINUE; -- Skip to next iteration if conversion fails
    END;

    -- Check if user with this ID exists
    user_found := EXISTS (
      SELECT 1 FROM users u WHERE u.id = user_id
    );

    -- If user found, fetch user details and return
    IF user_found THEN
      RETURN QUERY
      SELECT u.id, u.username, u.name FROM users u WHERE u.id = user_id;
    END IF;
  END LOOP;

  -- Return empty if no users found
  RETURN;
END;
$$;

ALTER FUNCTION "public"."get_mention"("user_ids" "text"[]) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."campuses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."campuses" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."chats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "room_id" "uuid" NOT NULL,
    "reply_id" "uuid",
    "deleted_at" timestamp with time zone
);

ALTER TABLE "public"."chats" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."colleges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "campus_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."colleges" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "thread_id" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."comments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."comments_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "comment_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."comments_likes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."followees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "followee_id" "uuid" NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."followees" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."followers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "followee_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."followers" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."global_chats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "public"."global_chat_type" NOT NULL,
    "content" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reply_id" "uuid",
    "deleted_at" timestamp with time zone,
    "campus_id" "uuid",
    "college_id" "uuid",
    "program_id" "uuid"
);

ALTER TABLE "public"."global_chats" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."likes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."ngl_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "deleted_at" timestamp with time zone
);

ALTER TABLE "public"."ngl_answers" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."ngl_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "code_name" "text" DEFAULT ''::"text",
    "deleted_at" timestamp with time zone
);

ALTER TABLE "public"."ngl_questions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "from_id" "uuid" NOT NULL,
    "to_id" "uuid" NOT NULL,
    "content_id" "uuid",
    "read" boolean DEFAULT false NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "trash" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."notifications" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "deleted_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "public"."post_type" NOT NULL
);

ALTER TABLE "public"."posts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."posts_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "order" smallint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."posts_images" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."programs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "college_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."programs" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."reported_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "comment_id" "uuid" NOT NULL,
    "reported_by_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."reported_comments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."reported_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "reported_by_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."reported_posts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."reported_problems" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "problem" "text" NOT NULL,
    "reported_by_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."reported_problems" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."reported_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reported_by_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."reported_users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);

ALTER TABLE "public"."rooms" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."rooms_users" (
    "room_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."rooms_users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."strikes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."strikes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."suggested_features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feature" "text" NOT NULL,
    "suggested_by_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."suggested_features" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "username" "text" NOT NULL,
    "email" character varying NOT NULL,
    "bio" "text",
    "link" "text",
    "image_name" "text",
    "deactivated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "public"."user_type" NOT NULL,
    "program_id" "uuid" NOT NULL,
    "verified_at" timestamp with time zone,
    "program_changed_at" timestamp with time zone,
    "banned_at" timestamp with time zone,
    "is_ngl_displayed" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE ONLY "public"."campuses"
    ADD CONSTRAINT "campuses_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."colleges"
    ADD CONSTRAINT "colleges_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."comments_likes"
    ADD CONSTRAINT "comments_likes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."followees"
    ADD CONSTRAINT "followees_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "followers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."global_chats"
    ADD CONSTRAINT "global_chats_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."ngl_answers"
    ADD CONSTRAINT "ngl_answers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."ngl_questions"
    ADD CONSTRAINT "ngl_questions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."posts_images"
    ADD CONSTRAINT "posts_images_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "programs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reported_comments"
    ADD CONSTRAINT "reported_comments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reported_posts"
    ADD CONSTRAINT "reported_post_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reported_problems"
    ADD CONSTRAINT "reported_problems_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reported_users"
    ADD CONSTRAINT "reported_users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."rooms_users"
    ADD CONSTRAINT "rooms_users_pkey" PRIMARY KEY ("room_id", "user_id");

ALTER TABLE ONLY "public"."strikes"
    ADD CONSTRAINT "strikes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."suggested_features"
    ADD CONSTRAINT "suggested_features_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");

CREATE INDEX "campuses_slug_idx" ON "public"."campuses" USING "btree" ("slug");

CREATE INDEX "chats_room_id_idx" ON "public"."chats" USING "btree" ("room_id");

CREATE INDEX "chats_user_id_idx" ON "public"."chats" USING "btree" ("user_id");

CREATE INDEX "chats_user_id_room_id_idx" ON "public"."chats" USING "btree" ("user_id", "room_id");

CREATE INDEX "colleges_campus_id_idx" ON "public"."colleges" USING "btree" ("campus_id");

CREATE INDEX "colleges_slug_idx" ON "public"."colleges" USING "btree" ("slug");

CREATE INDEX "comments_likes_comment_id_idx" ON "public"."comments_likes" USING "btree" ("comment_id");

CREATE INDEX "comments_likes_comment_id_user_id_idx" ON "public"."comments_likes" USING "btree" ("comment_id", "user_id");

CREATE INDEX "comments_likes_user_id_idx" ON "public"."comments_likes" USING "btree" ("user_id");

CREATE INDEX "comments_post_id_idx" ON "public"."comments" USING "btree" ("post_id");

CREATE INDEX "comments_post_id_user_id_idx" ON "public"."comments" USING "btree" ("post_id", "user_id");

CREATE INDEX "comments_thread_id_idx" ON "public"."comments" USING "btree" ("thread_id");

CREATE INDEX "comments_user_id_idx" ON "public"."comments" USING "btree" ("user_id");

CREATE INDEX "followees_followee_id_follower_id_idx" ON "public"."followees" USING "btree" ("followee_id", "follower_id");

CREATE INDEX "followees_followee_id_idx" ON "public"."followees" USING "btree" ("followee_id");

CREATE INDEX "followees_follower_id_idx" ON "public"."followees" USING "btree" ("follower_id");

CREATE INDEX "followers_followee_id_idx" ON "public"."followers" USING "btree" ("followee_id");

CREATE INDEX "followers_follower_id_followee_id_idx" ON "public"."followers" USING "btree" ("follower_id", "followee_id");

CREATE INDEX "followers_follower_id_idx" ON "public"."followers" USING "btree" ("follower_id");

CREATE INDEX "global_chats_type_idx" ON "public"."global_chats" USING "btree" ("type");

CREATE INDEX "global_chats_user_id_idx" ON "public"."global_chats" USING "btree" ("user_id");

CREATE INDEX "likes_post_id_idx" ON "public"."likes" USING "btree" ("post_id");

CREATE INDEX "likes_user_id_idx" ON "public"."likes" USING "btree" ("user_id");

CREATE INDEX "likes_user_id_post_id_idx" ON "public"."likes" USING "btree" ("user_id", "post_id");

CREATE INDEX "notifications_from_id_idx" ON "public"."notifications" USING "btree" ("from_id");

CREATE INDEX "notifications_to_id_idx" ON "public"."notifications" USING "btree" ("to_id");

CREATE INDEX "notifications_type_idx" ON "public"."notifications" USING "btree" ("type");

CREATE INDEX "posts_images_id_post_id_idx" ON "public"."posts_images" USING "btree" ("id", "post_id");

CREATE INDEX "posts_images_post_id_idx" ON "public"."posts_images" USING "btree" ("post_id");

CREATE INDEX "posts_type_idx" ON "public"."posts" USING "btree" ("type");

CREATE INDEX "posts_user_id_idx" ON "public"."posts" USING "btree" ("user_id");

CREATE INDEX "programs_college_id_idx" ON "public"."programs" USING "btree" ("college_id");

CREATE INDEX "programs_slug_idx" ON "public"."programs" USING "btree" ("slug");

ALTER TABLE ONLY "public"."ngl_answers"
    ADD CONSTRAINT "ngl_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."ngl_questions"("id");

ALTER TABLE ONLY "public"."ngl_questions"
    ADD CONSTRAINT "ngl_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "public_chats_reply_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "public"."chats"("id");

ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "public_chats_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id");

ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "public_chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."colleges"
    ADD CONSTRAINT "public_colleges_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id");

ALTER TABLE ONLY "public"."comments_likes"
    ADD CONSTRAINT "public_comments_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id");

ALTER TABLE ONLY "public"."comments_likes"
    ADD CONSTRAINT "public_comments_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "public_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "public_comments_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."comments"("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "public_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."followees"
    ADD CONSTRAINT "public_followees_followee_id_fkey" FOREIGN KEY ("followee_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."followees"
    ADD CONSTRAINT "public_followees_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "public_followers_followee_id_fkey" FOREIGN KEY ("followee_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."followers"
    ADD CONSTRAINT "public_followers_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."global_chats"
    ADD CONSTRAINT "public_global_chats_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id");

ALTER TABLE ONLY "public"."global_chats"
    ADD CONSTRAINT "public_global_chats_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id");

ALTER TABLE ONLY "public"."global_chats"
    ADD CONSTRAINT "public_global_chats_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id");

ALTER TABLE ONLY "public"."global_chats"
    ADD CONSTRAINT "public_global_chats_reply_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "public"."global_chats"("id");

ALTER TABLE ONLY "public"."global_chats"
    ADD CONSTRAINT "public_global_chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "public_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");

ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "public_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "public_notifications_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "public_notifications_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."posts_images"
    ADD CONSTRAINT "public_posts_images_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "public_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "public_programs_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id");

ALTER TABLE ONLY "public"."reported_comments"
    ADD CONSTRAINT "public_reported_comments_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id");

ALTER TABLE ONLY "public"."reported_comments"
    ADD CONSTRAINT "public_reported_comments_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."reported_posts"
    ADD CONSTRAINT "public_reported_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");

ALTER TABLE ONLY "public"."reported_posts"
    ADD CONSTRAINT "public_reported_post_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."reported_problems"
    ADD CONSTRAINT "public_reported_problems_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."reported_users"
    ADD CONSTRAINT "public_reported_users_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."reported_users"
    ADD CONSTRAINT "public_reported_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."rooms_users"
    ADD CONSTRAINT "public_rooms_users_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id");

ALTER TABLE ONLY "public"."rooms_users"
    ADD CONSTRAINT "public_rooms_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."suggested_features"
    ADD CONSTRAINT "public_suggested_features_suggested_by_id_fkey" FOREIGN KEY ("suggested_by_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "public_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "public_users_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id");

ALTER TABLE ONLY "public"."strikes"
    ADD CONSTRAINT "strikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

CREATE POLICY "Enable select for my data" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));

ALTER TABLE "public"."campuses" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."chats" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."colleges" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."comments_likes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."followees" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."followers" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."global_chats" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."ngl_answers" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."ngl_questions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts_images" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."programs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reported_comments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reported_posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reported_problems" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reported_users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."rooms" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."rooms_users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."strikes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."suggested_features" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."create_user"("user_id" "uuid", "email" "text", "created_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."create_user"("user_id" "uuid", "email" "text", "created_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user"("user_id" "uuid", "email" "text", "created_at" timestamp with time zone) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_mention"("user_ids" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_mention"("user_ids" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mention"("user_ids" "text"[]) TO "service_role";

GRANT ALL ON TABLE "public"."campuses" TO "anon";
GRANT ALL ON TABLE "public"."campuses" TO "authenticated";
GRANT ALL ON TABLE "public"."campuses" TO "service_role";

GRANT ALL ON TABLE "public"."chats" TO "anon";
GRANT ALL ON TABLE "public"."chats" TO "authenticated";
GRANT ALL ON TABLE "public"."chats" TO "service_role";

GRANT ALL ON TABLE "public"."colleges" TO "anon";
GRANT ALL ON TABLE "public"."colleges" TO "authenticated";
GRANT ALL ON TABLE "public"."colleges" TO "service_role";

GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";

GRANT ALL ON TABLE "public"."comments_likes" TO "anon";
GRANT ALL ON TABLE "public"."comments_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."comments_likes" TO "service_role";

GRANT ALL ON TABLE "public"."followees" TO "anon";
GRANT ALL ON TABLE "public"."followees" TO "authenticated";
GRANT ALL ON TABLE "public"."followees" TO "service_role";

GRANT ALL ON TABLE "public"."followers" TO "anon";
GRANT ALL ON TABLE "public"."followers" TO "authenticated";
GRANT ALL ON TABLE "public"."followers" TO "service_role";

GRANT ALL ON TABLE "public"."global_chats" TO "anon";
GRANT ALL ON TABLE "public"."global_chats" TO "authenticated";
GRANT ALL ON TABLE "public"."global_chats" TO "service_role";

GRANT ALL ON TABLE "public"."likes" TO "anon";
GRANT ALL ON TABLE "public"."likes" TO "authenticated";
GRANT ALL ON TABLE "public"."likes" TO "service_role";

GRANT ALL ON TABLE "public"."ngl_answers" TO "anon";
GRANT ALL ON TABLE "public"."ngl_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."ngl_answers" TO "service_role";

GRANT ALL ON TABLE "public"."ngl_questions" TO "anon";
GRANT ALL ON TABLE "public"."ngl_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."ngl_questions" TO "service_role";

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";

GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";

GRANT ALL ON TABLE "public"."posts_images" TO "anon";
GRANT ALL ON TABLE "public"."posts_images" TO "authenticated";
GRANT ALL ON TABLE "public"."posts_images" TO "service_role";

GRANT ALL ON TABLE "public"."programs" TO "anon";
GRANT ALL ON TABLE "public"."programs" TO "authenticated";
GRANT ALL ON TABLE "public"."programs" TO "service_role";

GRANT ALL ON TABLE "public"."reported_comments" TO "anon";
GRANT ALL ON TABLE "public"."reported_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."reported_comments" TO "service_role";

GRANT ALL ON TABLE "public"."reported_posts" TO "anon";
GRANT ALL ON TABLE "public"."reported_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."reported_posts" TO "service_role";

GRANT ALL ON TABLE "public"."reported_problems" TO "anon";
GRANT ALL ON TABLE "public"."reported_problems" TO "authenticated";
GRANT ALL ON TABLE "public"."reported_problems" TO "service_role";

GRANT ALL ON TABLE "public"."reported_users" TO "anon";
GRANT ALL ON TABLE "public"."reported_users" TO "authenticated";
GRANT ALL ON TABLE "public"."reported_users" TO "service_role";

GRANT ALL ON TABLE "public"."rooms" TO "anon";
GRANT ALL ON TABLE "public"."rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."rooms" TO "service_role";

GRANT ALL ON TABLE "public"."rooms_users" TO "anon";
GRANT ALL ON TABLE "public"."rooms_users" TO "authenticated";
GRANT ALL ON TABLE "public"."rooms_users" TO "service_role";

GRANT ALL ON TABLE "public"."strikes" TO "anon";
GRANT ALL ON TABLE "public"."strikes" TO "authenticated";
GRANT ALL ON TABLE "public"."strikes" TO "service_role";

GRANT ALL ON TABLE "public"."suggested_features" TO "anon";
GRANT ALL ON TABLE "public"."suggested_features" TO "authenticated";
GRANT ALL ON TABLE "public"."suggested_features" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
