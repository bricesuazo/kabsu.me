create table "public"."reported_users" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "reported_by_id" uuid not null,
    "reason" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."reported_users" enable row level security;

CREATE UNIQUE INDEX reported_users_pkey ON public.reported_users USING btree (id);

alter table "public"."reported_users" add constraint "reported_users_pkey" PRIMARY KEY using index "reported_users_pkey";

alter table "public"."reported_users" add constraint "public_reported_users_reported_by_id_fkey" FOREIGN KEY (reported_by_id) REFERENCES users(id) not valid;

alter table "public"."reported_users" validate constraint "public_reported_users_reported_by_id_fkey";

alter table "public"."reported_users" add constraint "public_reported_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."reported_users" validate constraint "public_reported_users_user_id_fkey";

grant delete on table "public"."reported_users" to "anon";

grant insert on table "public"."reported_users" to "anon";

grant references on table "public"."reported_users" to "anon";

grant select on table "public"."reported_users" to "anon";

grant trigger on table "public"."reported_users" to "anon";

grant truncate on table "public"."reported_users" to "anon";

grant update on table "public"."reported_users" to "anon";

grant delete on table "public"."reported_users" to "authenticated";

grant insert on table "public"."reported_users" to "authenticated";

grant references on table "public"."reported_users" to "authenticated";

grant select on table "public"."reported_users" to "authenticated";

grant trigger on table "public"."reported_users" to "authenticated";

grant truncate on table "public"."reported_users" to "authenticated";

grant update on table "public"."reported_users" to "authenticated";

grant delete on table "public"."reported_users" to "service_role";

grant insert on table "public"."reported_users" to "service_role";

grant references on table "public"."reported_users" to "service_role";

grant select on table "public"."reported_users" to "service_role";

grant trigger on table "public"."reported_users" to "service_role";

grant truncate on table "public"."reported_users" to "service_role";

grant update on table "public"."reported_users" to "service_role";


