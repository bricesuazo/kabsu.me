create table "public"."reported_comments" (
    "id" uuid not null default gen_random_uuid(),
    "comment_id" uuid not null,
    "reported_by_id" uuid not null,
    "reason" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."reported_comments" enable row level security;

CREATE UNIQUE INDEX reported_comments_pkey ON public.reported_comments USING btree (id);

alter table "public"."reported_comments" add constraint "reported_comments_pkey" PRIMARY KEY using index "reported_comments_pkey";

alter table "public"."reported_comments" add constraint "public_reported_comments_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES comments(id) not valid;

alter table "public"."reported_comments" validate constraint "public_reported_comments_comment_id_fkey";

alter table "public"."reported_comments" add constraint "public_reported_comments_reported_by_id_fkey" FOREIGN KEY (reported_by_id) REFERENCES users(id) not valid;

alter table "public"."reported_comments" validate constraint "public_reported_comments_reported_by_id_fkey";

grant delete on table "public"."reported_comments" to "anon";

grant insert on table "public"."reported_comments" to "anon";

grant references on table "public"."reported_comments" to "anon";

grant select on table "public"."reported_comments" to "anon";

grant trigger on table "public"."reported_comments" to "anon";

grant truncate on table "public"."reported_comments" to "anon";

grant update on table "public"."reported_comments" to "anon";

grant delete on table "public"."reported_comments" to "authenticated";

grant insert on table "public"."reported_comments" to "authenticated";

grant references on table "public"."reported_comments" to "authenticated";

grant select on table "public"."reported_comments" to "authenticated";

grant trigger on table "public"."reported_comments" to "authenticated";

grant truncate on table "public"."reported_comments" to "authenticated";

grant update on table "public"."reported_comments" to "authenticated";

grant delete on table "public"."reported_comments" to "service_role";

grant insert on table "public"."reported_comments" to "service_role";

grant references on table "public"."reported_comments" to "service_role";

grant select on table "public"."reported_comments" to "service_role";

grant trigger on table "public"."reported_comments" to "service_role";

grant truncate on table "public"."reported_comments" to "service_role";

grant update on table "public"."reported_comments" to "service_role";


