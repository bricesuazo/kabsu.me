create type "public"."post_type" as enum ('following', 'program', 'college', 'campus', 'all');

create table "public"."posts" (
    "id" uuid not null default gen_random_uuid(),
    "content" text not null,
    "user_id" uuid not null,
    "deleted_at" timestamp with time zone,
    "updated_at" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now(),
    "type" post_type not null
);


alter table "public"."posts" enable row level security;

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

CREATE INDEX posts_type_idx ON public.posts USING btree (type);

CREATE INDEX posts_user_id_idx ON public.posts USING btree (user_id);

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."posts" add constraint "public_posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."posts" validate constraint "public_posts_user_id_fkey";

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";


