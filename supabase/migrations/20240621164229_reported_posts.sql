create table "public"."reported_posts" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "reported_by_id" uuid not null,
    "reason" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."reported_posts" enable row level security;

CREATE UNIQUE INDEX reported_post_pkey ON public.reported_posts USING btree (id);

alter table "public"."reported_posts" add constraint "reported_post_pkey" PRIMARY KEY using index "reported_post_pkey";

alter table "public"."reported_posts" add constraint "public_reported_post_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) not valid;

alter table "public"."reported_posts" validate constraint "public_reported_post_post_id_fkey";

alter table "public"."reported_posts" add constraint "public_reported_post_reported_by_id_fkey" FOREIGN KEY (reported_by_id) REFERENCES users(id) not valid;

alter table "public"."reported_posts" validate constraint "public_reported_post_reported_by_id_fkey";

grant delete on table "public"."reported_posts" to "anon";

grant insert on table "public"."reported_posts" to "anon";

grant references on table "public"."reported_posts" to "anon";

grant select on table "public"."reported_posts" to "anon";

grant trigger on table "public"."reported_posts" to "anon";

grant truncate on table "public"."reported_posts" to "anon";

grant update on table "public"."reported_posts" to "anon";

grant delete on table "public"."reported_posts" to "authenticated";

grant insert on table "public"."reported_posts" to "authenticated";

grant references on table "public"."reported_posts" to "authenticated";

grant select on table "public"."reported_posts" to "authenticated";

grant trigger on table "public"."reported_posts" to "authenticated";

grant truncate on table "public"."reported_posts" to "authenticated";

grant update on table "public"."reported_posts" to "authenticated";

grant delete on table "public"."reported_posts" to "service_role";

grant insert on table "public"."reported_posts" to "service_role";

grant references on table "public"."reported_posts" to "service_role";

grant select on table "public"."reported_posts" to "service_role";

grant trigger on table "public"."reported_posts" to "service_role";

grant truncate on table "public"."reported_posts" to "service_role";

grant update on table "public"."reported_posts" to "service_role";


