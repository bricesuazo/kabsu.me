create table "public"."chats" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "content" text not null,
    "user_id" uuid not null,
    "room_id" uuid not null,
    "reply_id" uuid,
    "deleted_at" timestamp with time zone
);


alter table "public"."chats" enable row level security;

create table "public"."rooms" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
);


alter table "public"."rooms" enable row level security;

create table "public"."rooms_users" (
    "room_id" uuid not null,
    "user_id" uuid not null
);


alter table "public"."rooms_users" enable row level security;

CREATE UNIQUE INDEX chats_pkey ON public.chats USING btree (id);

CREATE INDEX chats_room_id_idx ON public.chats USING btree (room_id);

CREATE INDEX chats_user_id_idx ON public.chats USING btree (user_id);

CREATE INDEX chats_user_id_room_id_idx ON public.chats USING btree (user_id, room_id);

CREATE UNIQUE INDEX rooms_pkey ON public.rooms USING btree (id);

CREATE UNIQUE INDEX rooms_users_pkey ON public.rooms_users USING btree (room_id, user_id);

alter table "public"."chats" add constraint "chats_pkey" PRIMARY KEY using index "chats_pkey";

alter table "public"."rooms" add constraint "rooms_pkey" PRIMARY KEY using index "rooms_pkey";

alter table "public"."rooms_users" add constraint "rooms_users_pkey" PRIMARY KEY using index "rooms_users_pkey";

alter table "public"."chats" add constraint "public_chats_reply_id_fkey" FOREIGN KEY (reply_id) REFERENCES chats(id) not valid;

alter table "public"."chats" validate constraint "public_chats_reply_id_fkey";

alter table "public"."chats" add constraint "public_chats_room_id_fkey" FOREIGN KEY (room_id) REFERENCES rooms(id) not valid;

alter table "public"."chats" validate constraint "public_chats_room_id_fkey";

alter table "public"."chats" add constraint "public_chats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."chats" validate constraint "public_chats_user_id_fkey";

alter table "public"."rooms_users" add constraint "public_rooms_users_room_id_fkey" FOREIGN KEY (room_id) REFERENCES rooms(id) not valid;

alter table "public"."rooms_users" validate constraint "public_rooms_users_room_id_fkey";

alter table "public"."rooms_users" add constraint "public_rooms_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."rooms_users" validate constraint "public_rooms_users_user_id_fkey";

grant delete on table "public"."chats" to "anon";

grant insert on table "public"."chats" to "anon";

grant references on table "public"."chats" to "anon";

grant select on table "public"."chats" to "anon";

grant trigger on table "public"."chats" to "anon";

grant truncate on table "public"."chats" to "anon";

grant update on table "public"."chats" to "anon";

grant delete on table "public"."chats" to "authenticated";

grant insert on table "public"."chats" to "authenticated";

grant references on table "public"."chats" to "authenticated";

grant select on table "public"."chats" to "authenticated";

grant trigger on table "public"."chats" to "authenticated";

grant truncate on table "public"."chats" to "authenticated";

grant update on table "public"."chats" to "authenticated";

grant delete on table "public"."chats" to "service_role";

grant insert on table "public"."chats" to "service_role";

grant references on table "public"."chats" to "service_role";

grant select on table "public"."chats" to "service_role";

grant trigger on table "public"."chats" to "service_role";

grant truncate on table "public"."chats" to "service_role";

grant update on table "public"."chats" to "service_role";

grant delete on table "public"."rooms" to "anon";

grant insert on table "public"."rooms" to "anon";

grant references on table "public"."rooms" to "anon";

grant select on table "public"."rooms" to "anon";

grant trigger on table "public"."rooms" to "anon";

grant truncate on table "public"."rooms" to "anon";

grant update on table "public"."rooms" to "anon";

grant delete on table "public"."rooms" to "authenticated";

grant insert on table "public"."rooms" to "authenticated";

grant references on table "public"."rooms" to "authenticated";

grant select on table "public"."rooms" to "authenticated";

grant trigger on table "public"."rooms" to "authenticated";

grant truncate on table "public"."rooms" to "authenticated";

grant update on table "public"."rooms" to "authenticated";

grant delete on table "public"."rooms" to "service_role";

grant insert on table "public"."rooms" to "service_role";

grant references on table "public"."rooms" to "service_role";

grant select on table "public"."rooms" to "service_role";

grant trigger on table "public"."rooms" to "service_role";

grant truncate on table "public"."rooms" to "service_role";

grant update on table "public"."rooms" to "service_role";

grant delete on table "public"."rooms_users" to "anon";

grant insert on table "public"."rooms_users" to "anon";

grant references on table "public"."rooms_users" to "anon";

grant select on table "public"."rooms_users" to "anon";

grant trigger on table "public"."rooms_users" to "anon";

grant truncate on table "public"."rooms_users" to "anon";

grant update on table "public"."rooms_users" to "anon";

grant delete on table "public"."rooms_users" to "authenticated";

grant insert on table "public"."rooms_users" to "authenticated";

grant references on table "public"."rooms_users" to "authenticated";

grant select on table "public"."rooms_users" to "authenticated";

grant trigger on table "public"."rooms_users" to "authenticated";

grant truncate on table "public"."rooms_users" to "authenticated";

grant update on table "public"."rooms_users" to "authenticated";

grant delete on table "public"."rooms_users" to "service_role";

grant insert on table "public"."rooms_users" to "service_role";

grant references on table "public"."rooms_users" to "service_role";

grant select on table "public"."rooms_users" to "service_role";

grant trigger on table "public"."rooms_users" to "service_role";

grant truncate on table "public"."rooms_users" to "service_role";

grant update on table "public"."rooms_users" to "service_role";


