create table "public"."posts_images" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "post_id" uuid not null,
    "order" smallint not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."posts_images" enable row level security;

CREATE INDEX posts_images_id_post_id_idx ON public.posts_images USING btree (id, post_id);

CREATE UNIQUE INDEX posts_images_pkey ON public.posts_images USING btree (id);

CREATE INDEX posts_images_post_id_idx ON public.posts_images USING btree (post_id);

alter table "public"."posts_images" add constraint "posts_images_pkey" PRIMARY KEY using index "posts_images_pkey";

alter table "public"."posts_images" add constraint "public_posts_images_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) not valid;

alter table "public"."posts_images" validate constraint "public_posts_images_post_id_fkey";

grant delete on table "public"."posts_images" to "anon";

grant insert on table "public"."posts_images" to "anon";

grant references on table "public"."posts_images" to "anon";

grant select on table "public"."posts_images" to "anon";

grant trigger on table "public"."posts_images" to "anon";

grant truncate on table "public"."posts_images" to "anon";

grant update on table "public"."posts_images" to "anon";

grant delete on table "public"."posts_images" to "authenticated";

grant insert on table "public"."posts_images" to "authenticated";

grant references on table "public"."posts_images" to "authenticated";

grant select on table "public"."posts_images" to "authenticated";

grant trigger on table "public"."posts_images" to "authenticated";

grant truncate on table "public"."posts_images" to "authenticated";

grant update on table "public"."posts_images" to "authenticated";

grant delete on table "public"."posts_images" to "service_role";

grant insert on table "public"."posts_images" to "service_role";

grant references on table "public"."posts_images" to "service_role";

grant select on table "public"."posts_images" to "service_role";

grant trigger on table "public"."posts_images" to "service_role";

grant truncate on table "public"."posts_images" to "service_role";

grant update on table "public"."posts_images" to "service_role";


