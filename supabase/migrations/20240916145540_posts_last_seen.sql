create table "public"."posts_last_seen" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "all" uuid,
    "campus" uuid,
    "college" uuid,
    "program" uuid,
    "following" uuid
);


alter table "public"."posts_last_seen" enable row level security;

CREATE UNIQUE INDEX posts_last_seen_pkey ON public.posts_last_seen USING btree (id);

alter table "public"."posts_last_seen" add constraint "posts_last_seen_pkey" PRIMARY KEY using index "posts_last_seen_pkey";

alter table "public"."posts_last_seen" add constraint "posts_last_seen_all_fkey" FOREIGN KEY ("all") REFERENCES posts(id) not valid;

alter table "public"."posts_last_seen" validate constraint "posts_last_seen_all_fkey";

alter table "public"."posts_last_seen" add constraint "posts_last_seen_campus_fkey" FOREIGN KEY (campus) REFERENCES posts(id) not valid;

alter table "public"."posts_last_seen" validate constraint "posts_last_seen_campus_fkey";

alter table "public"."posts_last_seen" add constraint "posts_last_seen_college_fkey" FOREIGN KEY (college) REFERENCES posts(id) not valid;

alter table "public"."posts_last_seen" validate constraint "posts_last_seen_college_fkey";

alter table "public"."posts_last_seen" add constraint "posts_last_seen_following_fkey" FOREIGN KEY (following) REFERENCES posts(id) not valid;

alter table "public"."posts_last_seen" validate constraint "posts_last_seen_following_fkey";

alter table "public"."posts_last_seen" add constraint "posts_last_seen_program_fkey" FOREIGN KEY (program) REFERENCES posts(id) not valid;

alter table "public"."posts_last_seen" validate constraint "posts_last_seen_program_fkey";

alter table "public"."posts_last_seen" add constraint "posts_last_seen_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."posts_last_seen" validate constraint "posts_last_seen_user_id_fkey";

grant delete on table "public"."posts_last_seen" to "anon";

grant insert on table "public"."posts_last_seen" to "anon";

grant references on table "public"."posts_last_seen" to "anon";

grant select on table "public"."posts_last_seen" to "anon";

grant trigger on table "public"."posts_last_seen" to "anon";

grant truncate on table "public"."posts_last_seen" to "anon";

grant update on table "public"."posts_last_seen" to "anon";

grant delete on table "public"."posts_last_seen" to "authenticated";

grant insert on table "public"."posts_last_seen" to "authenticated";

grant references on table "public"."posts_last_seen" to "authenticated";

grant select on table "public"."posts_last_seen" to "authenticated";

grant trigger on table "public"."posts_last_seen" to "authenticated";

grant truncate on table "public"."posts_last_seen" to "authenticated";

grant update on table "public"."posts_last_seen" to "authenticated";

grant delete on table "public"."posts_last_seen" to "service_role";

grant insert on table "public"."posts_last_seen" to "service_role";

grant references on table "public"."posts_last_seen" to "service_role";

grant select on table "public"."posts_last_seen" to "service_role";

grant trigger on table "public"."posts_last_seen" to "service_role";

grant truncate on table "public"."posts_last_seen" to "service_role";

grant update on table "public"."posts_last_seen" to "service_role";


