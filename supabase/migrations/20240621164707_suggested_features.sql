create table "public"."suggested_features" (
    "id" uuid not null default gen_random_uuid(),
    "feature" text not null,
    "suggested_by_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."suggested_features" enable row level security;

CREATE UNIQUE INDEX suggested_features_pkey ON public.suggested_features USING btree (id);

alter table "public"."suggested_features" add constraint "suggested_features_pkey" PRIMARY KEY using index "suggested_features_pkey";

alter table "public"."suggested_features" add constraint "public_suggested_features_suggested_by_id_fkey" FOREIGN KEY (suggested_by_id) REFERENCES users(id) not valid;

alter table "public"."suggested_features" validate constraint "public_suggested_features_suggested_by_id_fkey";

grant delete on table "public"."suggested_features" to "anon";

grant insert on table "public"."suggested_features" to "anon";

grant references on table "public"."suggested_features" to "anon";

grant select on table "public"."suggested_features" to "anon";

grant trigger on table "public"."suggested_features" to "anon";

grant truncate on table "public"."suggested_features" to "anon";

grant update on table "public"."suggested_features" to "anon";

grant delete on table "public"."suggested_features" to "authenticated";

grant insert on table "public"."suggested_features" to "authenticated";

grant references on table "public"."suggested_features" to "authenticated";

grant select on table "public"."suggested_features" to "authenticated";

grant trigger on table "public"."suggested_features" to "authenticated";

grant truncate on table "public"."suggested_features" to "authenticated";

grant update on table "public"."suggested_features" to "authenticated";

grant delete on table "public"."suggested_features" to "service_role";

grant insert on table "public"."suggested_features" to "service_role";

grant references on table "public"."suggested_features" to "service_role";

grant select on table "public"."suggested_features" to "service_role";

grant trigger on table "public"."suggested_features" to "service_role";

grant truncate on table "public"."suggested_features" to "service_role";

grant update on table "public"."suggested_features" to "service_role";


