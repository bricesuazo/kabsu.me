alter table "public"."users" add column "pinned_post" uuid;

alter table "public"."users" add constraint "public_users_pinned_post_fkey" FOREIGN KEY (pinned_post) REFERENCES users(id) ON DELETE SET NULL not valid;

alter table "public"."users" validate constraint "public_users_pinned_post_fkey";


