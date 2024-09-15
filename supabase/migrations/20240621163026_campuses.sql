create table "public"."campuses" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."campuses" enable row level security;

CREATE UNIQUE INDEX campuses_pkey ON public.campuses USING btree (id);

CREATE INDEX campuses_slug_idx ON public.campuses USING btree (slug);

alter table "public"."campuses" add constraint "campuses_pkey" PRIMARY KEY using index "campuses_pkey";

grant delete on table "public"."campuses" to "anon";

grant insert on table "public"."campuses" to "anon";

grant references on table "public"."campuses" to "anon";

grant select on table "public"."campuses" to "anon";

grant trigger on table "public"."campuses" to "anon";

grant truncate on table "public"."campuses" to "anon";

grant update on table "public"."campuses" to "anon";

grant delete on table "public"."campuses" to "authenticated";

grant insert on table "public"."campuses" to "authenticated";

grant references on table "public"."campuses" to "authenticated";

grant select on table "public"."campuses" to "authenticated";

grant trigger on table "public"."campuses" to "authenticated";

grant truncate on table "public"."campuses" to "authenticated";

grant update on table "public"."campuses" to "authenticated";

grant delete on table "public"."campuses" to "service_role";

grant insert on table "public"."campuses" to "service_role";

grant references on table "public"."campuses" to "service_role";

grant select on table "public"."campuses" to "service_role";

grant trigger on table "public"."campuses" to "service_role";

grant truncate on table "public"."campuses" to "service_role";

grant update on table "public"."campuses" to "service_role";


