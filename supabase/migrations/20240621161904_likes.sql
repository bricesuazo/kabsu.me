create table "public"."likes" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "post_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."likes" enable row level security;

CREATE UNIQUE INDEX likes_pkey ON public.likes USING btree (id);

CREATE INDEX likes_post_id_idx ON public.likes USING btree (post_id);

CREATE INDEX likes_user_id_idx ON public.likes USING btree (user_id);

CREATE INDEX likes_user_id_post_id_idx ON public.likes USING btree (user_id, post_id);

alter table "public"."likes" add constraint "likes_pkey" PRIMARY KEY using index "likes_pkey";

alter table "public"."likes" add constraint "public_likes_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) not valid;

alter table "public"."likes" validate constraint "public_likes_post_id_fkey";

alter table "public"."likes" add constraint "public_likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."likes" validate constraint "public_likes_user_id_fkey";

grant delete on table "public"."likes" to "anon";

grant insert on table "public"."likes" to "anon";

grant references on table "public"."likes" to "anon";

grant select on table "public"."likes" to "anon";

grant trigger on table "public"."likes" to "anon";

grant truncate on table "public"."likes" to "anon";

grant update on table "public"."likes" to "anon";

grant delete on table "public"."likes" to "authenticated";

grant insert on table "public"."likes" to "authenticated";

grant references on table "public"."likes" to "authenticated";

grant select on table "public"."likes" to "authenticated";

grant trigger on table "public"."likes" to "authenticated";

grant truncate on table "public"."likes" to "authenticated";

grant update on table "public"."likes" to "authenticated";

grant delete on table "public"."likes" to "service_role";

grant insert on table "public"."likes" to "service_role";

grant references on table "public"."likes" to "service_role";

grant select on table "public"."likes" to "service_role";

grant trigger on table "public"."likes" to "service_role";

grant truncate on table "public"."likes" to "service_role";

grant update on table "public"."likes" to "service_role";


