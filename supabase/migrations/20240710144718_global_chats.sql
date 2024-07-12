create type "public"."global_chat_type" as enum ('all', 'campus', 'college', 'program');

create table "public"."global_chats" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "type" global_chat_type not null,
    "content" text not null,
    "user_id" uuid not null,
    "reply_id" uuid,
    "deleted_at" timestamp with time zone
);


alter table "public"."global_chats" enable row level security;

CREATE UNIQUE INDEX global_chats_pkey ON public.global_chats USING btree (id);

CREATE INDEX global_chats_type_idx ON public.global_chats USING btree (type);

CREATE INDEX global_chats_user_id_idx ON public.global_chats USING btree (user_id);

alter table "public"."global_chats" add constraint "global_chats_pkey" PRIMARY KEY using index "global_chats_pkey";

alter table "public"."global_chats" add constraint "public_global_chats_reply_id_fkey" FOREIGN KEY (reply_id) REFERENCES global_chats(id) not valid;

alter table "public"."global_chats" validate constraint "public_global_chats_reply_id_fkey";

alter table "public"."global_chats" add constraint "public_global_chats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."global_chats" validate constraint "public_global_chats_user_id_fkey";

grant delete on table "public"."global_chats" to "anon";

grant insert on table "public"."global_chats" to "anon";

grant references on table "public"."global_chats" to "anon";

grant select on table "public"."global_chats" to "anon";

grant trigger on table "public"."global_chats" to "anon";

grant truncate on table "public"."global_chats" to "anon";

grant update on table "public"."global_chats" to "anon";

grant delete on table "public"."global_chats" to "authenticated";

grant insert on table "public"."global_chats" to "authenticated";

grant references on table "public"."global_chats" to "authenticated";

grant select on table "public"."global_chats" to "authenticated";

grant trigger on table "public"."global_chats" to "authenticated";

grant truncate on table "public"."global_chats" to "authenticated";

grant update on table "public"."global_chats" to "authenticated";

grant delete on table "public"."global_chats" to "service_role";

grant insert on table "public"."global_chats" to "service_role";

grant references on table "public"."global_chats" to "service_role";

grant select on table "public"."global_chats" to "service_role";

grant trigger on table "public"."global_chats" to "service_role";

grant truncate on table "public"."global_chats" to "service_role";

grant update on table "public"."global_chats" to "service_role";


