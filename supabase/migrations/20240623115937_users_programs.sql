alter table "public"."users" add constraint "public_users_program_id_fkey" FOREIGN KEY (program_id) REFERENCES programs(id) not valid;

alter table "public"."users" validate constraint "public_users_program_id_fkey";


