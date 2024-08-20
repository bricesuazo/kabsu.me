create table "public"."ngl_answers" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "content" text not null,
    "question_id" uuid not null,
    "deleted_at" timestamp with time zone
);


alter table "public"."ngl_answers" enable row level security;

create table "public"."ngl_questions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "content" text not null,
    "code_name" text default ''::text,
    "deleted_at" timestamp with time zone
);


alter table "public"."ngl_questions" enable row level security;

alter table "public"."users" add column "is_ngl_displayed" boolean not null default true;

CREATE UNIQUE INDEX ngl_answers_pkey ON public.ngl_answers USING btree (id);

CREATE UNIQUE INDEX ngl_questions_pkey ON public.ngl_questions USING btree (id);

alter table "public"."ngl_answers" add constraint "ngl_answers_pkey" PRIMARY KEY using index "ngl_answers_pkey";

alter table "public"."ngl_questions" add constraint "ngl_questions_pkey" PRIMARY KEY using index "ngl_questions_pkey";

alter table "public"."ngl_answers" add constraint "ngl_answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES ngl_questions(id) not valid;

alter table "public"."ngl_answers" validate constraint "ngl_answers_question_id_fkey";

alter table "public"."ngl_questions" add constraint "ngl_questions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."ngl_questions" validate constraint "ngl_questions_user_id_fkey";

grant delete on table "public"."ngl_answers" to "anon";

grant insert on table "public"."ngl_answers" to "anon";

grant references on table "public"."ngl_answers" to "anon";

grant select on table "public"."ngl_answers" to "anon";

grant trigger on table "public"."ngl_answers" to "anon";

grant truncate on table "public"."ngl_answers" to "anon";

grant update on table "public"."ngl_answers" to "anon";

grant delete on table "public"."ngl_answers" to "authenticated";

grant insert on table "public"."ngl_answers" to "authenticated";

grant references on table "public"."ngl_answers" to "authenticated";

grant select on table "public"."ngl_answers" to "authenticated";

grant trigger on table "public"."ngl_answers" to "authenticated";

grant truncate on table "public"."ngl_answers" to "authenticated";

grant update on table "public"."ngl_answers" to "authenticated";

grant delete on table "public"."ngl_answers" to "service_role";

grant insert on table "public"."ngl_answers" to "service_role";

grant references on table "public"."ngl_answers" to "service_role";

grant select on table "public"."ngl_answers" to "service_role";

grant trigger on table "public"."ngl_answers" to "service_role";

grant truncate on table "public"."ngl_answers" to "service_role";

grant update on table "public"."ngl_answers" to "service_role";

grant delete on table "public"."ngl_questions" to "anon";

grant insert on table "public"."ngl_questions" to "anon";

grant references on table "public"."ngl_questions" to "anon";

grant select on table "public"."ngl_questions" to "anon";

grant trigger on table "public"."ngl_questions" to "anon";

grant truncate on table "public"."ngl_questions" to "anon";

grant update on table "public"."ngl_questions" to "anon";

grant delete on table "public"."ngl_questions" to "authenticated";

grant insert on table "public"."ngl_questions" to "authenticated";

grant references on table "public"."ngl_questions" to "authenticated";

grant select on table "public"."ngl_questions" to "authenticated";

grant trigger on table "public"."ngl_questions" to "authenticated";

grant truncate on table "public"."ngl_questions" to "authenticated";

grant update on table "public"."ngl_questions" to "authenticated";

grant delete on table "public"."ngl_questions" to "service_role";

grant insert on table "public"."ngl_questions" to "service_role";

grant references on table "public"."ngl_questions" to "service_role";

grant select on table "public"."ngl_questions" to "service_role";

grant trigger on table "public"."ngl_questions" to "service_role";

grant truncate on table "public"."ngl_questions" to "service_role";

grant update on table "public"."ngl_questions" to "service_role";


