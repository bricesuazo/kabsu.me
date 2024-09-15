create table "public"."comments_likes" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "comment_id" uuid not null,
    "user_id" uuid not null
);


alter table "public"."comments_likes" enable row level security;

CREATE INDEX comments_likes_comment_id_idx ON public.comments_likes USING btree (comment_id);

CREATE INDEX comments_likes_comment_id_user_id_idx ON public.comments_likes USING btree (comment_id, user_id);

CREATE UNIQUE INDEX comments_likes_pkey ON public.comments_likes USING btree (id);

CREATE INDEX comments_likes_user_id_idx ON public.comments_likes USING btree (user_id);

alter table "public"."comments_likes" add constraint "comments_likes_pkey" PRIMARY KEY using index "comments_likes_pkey";

alter table "public"."comments_likes" add constraint "public_comments_likes_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES comments(id) not valid;

alter table "public"."comments_likes" validate constraint "public_comments_likes_comment_id_fkey";

alter table "public"."comments_likes" add constraint "public_comments_likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."comments_likes" validate constraint "public_comments_likes_user_id_fkey";

grant delete on table "public"."comments_likes" to "anon";

grant insert on table "public"."comments_likes" to "anon";

grant references on table "public"."comments_likes" to "anon";

grant select on table "public"."comments_likes" to "anon";

grant trigger on table "public"."comments_likes" to "anon";

grant truncate on table "public"."comments_likes" to "anon";

grant update on table "public"."comments_likes" to "anon";

grant delete on table "public"."comments_likes" to "authenticated";

grant insert on table "public"."comments_likes" to "authenticated";

grant references on table "public"."comments_likes" to "authenticated";

grant select on table "public"."comments_likes" to "authenticated";

grant trigger on table "public"."comments_likes" to "authenticated";

grant truncate on table "public"."comments_likes" to "authenticated";

grant update on table "public"."comments_likes" to "authenticated";

grant delete on table "public"."comments_likes" to "service_role";

grant insert on table "public"."comments_likes" to "service_role";

grant references on table "public"."comments_likes" to "service_role";

grant select on table "public"."comments_likes" to "service_role";

grant trigger on table "public"."comments_likes" to "service_role";

grant truncate on table "public"."comments_likes" to "service_role";

grant update on table "public"."comments_likes" to "service_role";


