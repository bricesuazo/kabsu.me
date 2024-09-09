create table "public"."prof_posts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "description" text not null default ''::text
);


alter table "public"."prof_posts" enable row level security;

create table "public"."prof_posts_programs" (
    "id" uuid not null default gen_random_uuid(),
    "prof_post_id" uuid not null,
    "program_id" uuid not null,
    "year" smallint not null,
    "section" smallint not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."prof_posts_programs" enable row level security;

CREATE UNIQUE INDEX prof_posts_pkey ON public.prof_posts USING btree (id);

CREATE UNIQUE INDEX prof_posts_programs_pkey ON public.prof_posts_programs USING btree (id);

alter table "public"."prof_posts" add constraint "prof_posts_pkey" PRIMARY KEY using index "prof_posts_pkey";

alter table "public"."prof_posts_programs" add constraint "prof_posts_programs_pkey" PRIMARY KEY using index "prof_posts_programs_pkey";

alter table "public"."prof_posts" add constraint "prof_posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."prof_posts" validate constraint "prof_posts_user_id_fkey";

alter table "public"."prof_posts_programs" add constraint "prof_posts_programs_prof_post_id_fkey" FOREIGN KEY (prof_post_id) REFERENCES prof_posts(id) not valid;

alter table "public"."prof_posts_programs" validate constraint "prof_posts_programs_prof_post_id_fkey";

alter table "public"."prof_posts_programs" add constraint "prof_posts_programs_program_id_fkey" FOREIGN KEY (program_id) REFERENCES programs(id) not valid;

alter table "public"."prof_posts_programs" validate constraint "prof_posts_programs_program_id_fkey";

grant delete on table "public"."prof_posts" to "anon";

grant insert on table "public"."prof_posts" to "anon";

grant references on table "public"."prof_posts" to "anon";

grant select on table "public"."prof_posts" to "anon";

grant trigger on table "public"."prof_posts" to "anon";

grant truncate on table "public"."prof_posts" to "anon";

grant update on table "public"."prof_posts" to "anon";

grant delete on table "public"."prof_posts" to "authenticated";

grant insert on table "public"."prof_posts" to "authenticated";

grant references on table "public"."prof_posts" to "authenticated";

grant select on table "public"."prof_posts" to "authenticated";

grant trigger on table "public"."prof_posts" to "authenticated";

grant truncate on table "public"."prof_posts" to "authenticated";

grant update on table "public"."prof_posts" to "authenticated";

grant delete on table "public"."prof_posts" to "service_role";

grant insert on table "public"."prof_posts" to "service_role";

grant references on table "public"."prof_posts" to "service_role";

grant select on table "public"."prof_posts" to "service_role";

grant trigger on table "public"."prof_posts" to "service_role";

grant truncate on table "public"."prof_posts" to "service_role";

grant update on table "public"."prof_posts" to "service_role";

grant delete on table "public"."prof_posts_programs" to "anon";

grant insert on table "public"."prof_posts_programs" to "anon";

grant references on table "public"."prof_posts_programs" to "anon";

grant select on table "public"."prof_posts_programs" to "anon";

grant trigger on table "public"."prof_posts_programs" to "anon";

grant truncate on table "public"."prof_posts_programs" to "anon";

grant update on table "public"."prof_posts_programs" to "anon";

grant delete on table "public"."prof_posts_programs" to "authenticated";

grant insert on table "public"."prof_posts_programs" to "authenticated";

grant references on table "public"."prof_posts_programs" to "authenticated";

grant select on table "public"."prof_posts_programs" to "authenticated";

grant trigger on table "public"."prof_posts_programs" to "authenticated";

grant truncate on table "public"."prof_posts_programs" to "authenticated";

grant update on table "public"."prof_posts_programs" to "authenticated";

grant delete on table "public"."prof_posts_programs" to "service_role";

grant insert on table "public"."prof_posts_programs" to "service_role";

grant references on table "public"."prof_posts_programs" to "service_role";

grant select on table "public"."prof_posts_programs" to "service_role";

grant trigger on table "public"."prof_posts_programs" to "service_role";

grant truncate on table "public"."prof_posts_programs" to "service_role";

grant update on table "public"."prof_posts_programs" to "service_role";


