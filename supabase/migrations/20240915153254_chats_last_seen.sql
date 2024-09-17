alter table "public"."rooms_users" add column "last_seen_chat_id" uuid;

alter table "public"."rooms_users" add constraint "rooms_users_last_seen_chat_id_fkey" FOREIGN KEY (last_seen_chat_id) REFERENCES chats(id) not valid;

alter table "public"."rooms_users" validate constraint "rooms_users_last_seen_chat_id_fkey";


