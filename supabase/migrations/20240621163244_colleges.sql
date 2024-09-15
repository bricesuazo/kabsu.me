create table "public"."colleges" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "campus_id" uuid not null,
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."colleges" enable row level security;

CREATE INDEX colleges_campus_id_idx ON public.colleges USING btree (campus_id);

CREATE UNIQUE INDEX colleges_pkey ON public.colleges USING btree (id);

CREATE INDEX colleges_slug_idx ON public.colleges USING btree (slug);

alter table "public"."colleges" add constraint "colleges_pkey" PRIMARY KEY using index "colleges_pkey";

alter table "public"."colleges" add constraint "public_colleges_campus_id_fkey" FOREIGN KEY (campus_id) REFERENCES campuses(id) not valid;

alter table "public"."colleges" validate constraint "public_colleges_campus_id_fkey";

grant delete on table "public"."colleges" to "anon";

grant insert on table "public"."colleges" to "anon";

grant references on table "public"."colleges" to "anon";

grant select on table "public"."colleges" to "anon";

grant trigger on table "public"."colleges" to "anon";

grant truncate on table "public"."colleges" to "anon";

grant update on table "public"."colleges" to "anon";

grant delete on table "public"."colleges" to "authenticated";

grant insert on table "public"."colleges" to "authenticated";

grant references on table "public"."colleges" to "authenticated";

grant select on table "public"."colleges" to "authenticated";

grant trigger on table "public"."colleges" to "authenticated";

grant truncate on table "public"."colleges" to "authenticated";

grant update on table "public"."colleges" to "authenticated";

grant delete on table "public"."colleges" to "service_role";

grant insert on table "public"."colleges" to "service_role";

grant references on table "public"."colleges" to "service_role";

grant select on table "public"."colleges" to "service_role";

grant trigger on table "public"."colleges" to "service_role";

grant truncate on table "public"."colleges" to "service_role";

grant update on table "public"."colleges" to "service_role";


