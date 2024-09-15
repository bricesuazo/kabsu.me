create table "public"."followers" (
    "id" uuid not null default gen_random_uuid(),
    "follower_id" uuid not null,
    "followee_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."followers" enable row level security;

CREATE INDEX followers_followee_id_idx ON public.followers USING btree (followee_id);

CREATE INDEX followers_follower_id_followee_id_idx ON public.followers USING btree (follower_id, followee_id);

CREATE INDEX followers_follower_id_idx ON public.followers USING btree (follower_id);

CREATE UNIQUE INDEX followers_pkey ON public.followers USING btree (id);

alter table "public"."followers" add constraint "followers_pkey" PRIMARY KEY using index "followers_pkey";

alter table "public"."followers" add constraint "public_followers_followee_id_fkey" FOREIGN KEY (followee_id) REFERENCES users(id) not valid;

alter table "public"."followers" validate constraint "public_followers_followee_id_fkey";

alter table "public"."followers" add constraint "public_followers_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES users(id) not valid;

alter table "public"."followers" validate constraint "public_followers_follower_id_fkey";

grant delete on table "public"."followers" to "anon";

grant insert on table "public"."followers" to "anon";

grant references on table "public"."followers" to "anon";

grant select on table "public"."followers" to "anon";

grant trigger on table "public"."followers" to "anon";

grant truncate on table "public"."followers" to "anon";

grant update on table "public"."followers" to "anon";

grant delete on table "public"."followers" to "authenticated";

grant insert on table "public"."followers" to "authenticated";

grant references on table "public"."followers" to "authenticated";

grant select on table "public"."followers" to "authenticated";

grant trigger on table "public"."followers" to "authenticated";

grant truncate on table "public"."followers" to "authenticated";

grant update on table "public"."followers" to "authenticated";

grant delete on table "public"."followers" to "service_role";

grant insert on table "public"."followers" to "service_role";

grant references on table "public"."followers" to "service_role";

grant select on table "public"."followers" to "service_role";

grant trigger on table "public"."followers" to "service_role";

grant truncate on table "public"."followers" to "service_role";

grant update on table "public"."followers" to "service_role";


