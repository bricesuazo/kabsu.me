create table "public"."comments" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "post_id" uuid not null,
    "content" text not null,
    "thread_id" uuid,
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."comments" enable row level security;

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE INDEX comments_post_id_idx ON public.comments USING btree (post_id);

CREATE INDEX comments_post_id_user_id_idx ON public.comments USING btree (post_id, user_id);

CREATE INDEX comments_thread_id_idx ON public.comments USING btree (thread_id);

CREATE INDEX comments_user_id_idx ON public.comments USING btree (user_id);

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."comments" add constraint "public_comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) not valid;

alter table "public"."comments" validate constraint "public_comments_post_id_fkey";

alter table "public"."comments" add constraint "public_comments_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES comments(id) not valid;

alter table "public"."comments" validate constraint "public_comments_thread_id_fkey";

alter table "public"."comments" add constraint "public_comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."comments" validate constraint "public_comments_user_id_fkey";

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";


