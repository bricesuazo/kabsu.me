create table "public"."followees" (
    "id" uuid not null default gen_random_uuid(),
    "followee_id" uuid not null,
    "follower_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."followees" enable row level security;

CREATE INDEX followees_followee_id_follower_id_idx ON public.followees USING btree (followee_id, follower_id);

CREATE INDEX followees_followee_id_idx ON public.followees USING btree (followee_id);

CREATE INDEX followees_follower_id_idx ON public.followees USING btree (follower_id);

CREATE UNIQUE INDEX followees_pkey ON public.followees USING btree (id);

alter table "public"."followees" add constraint "followees_pkey" PRIMARY KEY using index "followees_pkey";

alter table "public"."followees" add constraint "public_followees_followee_id_fkey" FOREIGN KEY (followee_id) REFERENCES users(id) not valid;

alter table "public"."followees" validate constraint "public_followees_followee_id_fkey";

alter table "public"."followees" add constraint "public_followees_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES users(id) not valid;

alter table "public"."followees" validate constraint "public_followees_follower_id_fkey";

grant delete on table "public"."followees" to "anon";

grant insert on table "public"."followees" to "anon";

grant references on table "public"."followees" to "anon";

grant select on table "public"."followees" to "anon";

grant trigger on table "public"."followees" to "anon";

grant truncate on table "public"."followees" to "anon";

grant update on table "public"."followees" to "anon";

grant delete on table "public"."followees" to "authenticated";

grant insert on table "public"."followees" to "authenticated";

grant references on table "public"."followees" to "authenticated";

grant select on table "public"."followees" to "authenticated";

grant trigger on table "public"."followees" to "authenticated";

grant truncate on table "public"."followees" to "authenticated";

grant update on table "public"."followees" to "authenticated";

grant delete on table "public"."followees" to "service_role";

grant insert on table "public"."followees" to "service_role";

grant references on table "public"."followees" to "service_role";

grant select on table "public"."followees" to "service_role";

grant trigger on table "public"."followees" to "service_role";

grant truncate on table "public"."followees" to "service_role";

grant update on table "public"."followees" to "service_role";


