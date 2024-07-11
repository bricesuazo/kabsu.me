alter table "public"."global_chats" add column "campus_id" uuid;

alter table "public"."global_chats" add column "college_id" uuid;

alter table "public"."global_chats" add column "program_id" uuid;

alter table "public"."global_chats" add constraint "public_global_chats_campus_id_fkey" FOREIGN KEY (campus_id) REFERENCES campuses(id) not valid;

alter table "public"."global_chats" validate constraint "public_global_chats_campus_id_fkey";

alter table "public"."global_chats" add constraint "public_global_chats_college_id_fkey" FOREIGN KEY (college_id) REFERENCES colleges(id) not valid;

alter table "public"."global_chats" validate constraint "public_global_chats_college_id_fkey";

alter table "public"."global_chats" add constraint "public_global_chats_program_id_fkey" FOREIGN KEY (program_id) REFERENCES programs(id) not valid;

alter table "public"."global_chats" validate constraint "public_global_chats_program_id_fkey";


