create type "public"."notification_type" as enum ('like', 'comment', 'follow', 'mention_post', 'mention_comment');

create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "from_id" uuid not null,
    "to_id" uuid not null,
    "content_id" uuid default gen_random_uuid(),
    "read" boolean not null default false,
    "type" notification_type not null,
    "trash" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."notifications" enable row level security;

CREATE INDEX notifications_from_id_idx ON public.notifications USING btree (from_id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE INDEX notifications_to_id_idx ON public.notifications USING btree (to_id);

CREATE INDEX notifications_type_idx ON public.notifications USING btree (type);

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."notifications" add constraint "public_notifications_from_id_fkey" FOREIGN KEY (from_id) REFERENCES users(id) not valid;

alter table "public"."notifications" validate constraint "public_notifications_from_id_fkey";

alter table "public"."notifications" add constraint "public_notifications_to_id_fkey" FOREIGN KEY (to_id) REFERENCES users(id) not valid;

alter table "public"."notifications" validate constraint "public_notifications_to_id_fkey";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";


