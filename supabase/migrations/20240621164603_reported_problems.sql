create table "public"."reported_problems" (
    "id" uuid not null default gen_random_uuid(),
    "problem" text not null,
    "reported_by_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."reported_problems" enable row level security;

CREATE UNIQUE INDEX reported_problems_pkey ON public.reported_problems USING btree (id);

alter table "public"."reported_problems" add constraint "reported_problems_pkey" PRIMARY KEY using index "reported_problems_pkey";

alter table "public"."reported_problems" add constraint "public_reported_problems_reported_by_id_fkey" FOREIGN KEY (reported_by_id) REFERENCES users(id) not valid;

alter table "public"."reported_problems" validate constraint "public_reported_problems_reported_by_id_fkey";

grant delete on table "public"."reported_problems" to "anon";

grant insert on table "public"."reported_problems" to "anon";

grant references on table "public"."reported_problems" to "anon";

grant select on table "public"."reported_problems" to "anon";

grant trigger on table "public"."reported_problems" to "anon";

grant truncate on table "public"."reported_problems" to "anon";

grant update on table "public"."reported_problems" to "anon";

grant delete on table "public"."reported_problems" to "authenticated";

grant insert on table "public"."reported_problems" to "authenticated";

grant references on table "public"."reported_problems" to "authenticated";

grant select on table "public"."reported_problems" to "authenticated";

grant trigger on table "public"."reported_problems" to "authenticated";

grant truncate on table "public"."reported_problems" to "authenticated";

grant update on table "public"."reported_problems" to "authenticated";

grant delete on table "public"."reported_problems" to "service_role";

grant insert on table "public"."reported_problems" to "service_role";

grant references on table "public"."reported_problems" to "service_role";

grant select on table "public"."reported_problems" to "service_role";

grant trigger on table "public"."reported_problems" to "service_role";

grant truncate on table "public"."reported_problems" to "service_role";

grant update on table "public"."reported_problems" to "service_role";


