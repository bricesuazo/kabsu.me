create table "public"."strikes" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "reason" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."strikes" enable row level security;

alter table "public"."users" add column "banned_at" timestamp with time zone;

CREATE UNIQUE INDEX strikes_pkey ON public.strikes USING btree (id);

alter table "public"."strikes" add constraint "strikes_pkey" PRIMARY KEY using index "strikes_pkey";

alter table "public"."strikes" add constraint "strikes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."strikes" validate constraint "strikes_user_id_fkey";

grant delete on table "public"."strikes" to "anon";

grant insert on table "public"."strikes" to "anon";

grant references on table "public"."strikes" to "anon";

grant select on table "public"."strikes" to "anon";

grant trigger on table "public"."strikes" to "anon";

grant truncate on table "public"."strikes" to "anon";

grant update on table "public"."strikes" to "anon";

grant delete on table "public"."strikes" to "authenticated";

grant insert on table "public"."strikes" to "authenticated";

grant references on table "public"."strikes" to "authenticated";

grant select on table "public"."strikes" to "authenticated";

grant trigger on table "public"."strikes" to "authenticated";

grant truncate on table "public"."strikes" to "authenticated";

grant update on table "public"."strikes" to "authenticated";

grant delete on table "public"."strikes" to "service_role";

grant insert on table "public"."strikes" to "service_role";

grant references on table "public"."strikes" to "service_role";

grant select on table "public"."strikes" to "service_role";

grant trigger on table "public"."strikes" to "service_role";

grant truncate on table "public"."strikes" to "service_role";

grant update on table "public"."strikes" to "service_role";


