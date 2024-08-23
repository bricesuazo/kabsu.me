alter type "public"."notification_type" rename to "notification_type__old_version_to_be_dropped";

create type "public"."notification_type" as enum ('like', 'comment', 'follow', 'mention_post', 'mention_comment', 'strike_account', 'strike_post', 'reply', 'ngl');

alter table "public"."notifications" alter column type type "public"."notification_type" using type::text::"public"."notification_type";

drop type "public"."notification_type__old_version_to_be_dropped";

alter table "public"."notifications" add column "ngl_question_id" uuid;

alter table "public"."notifications" add constraint "notifications_ngl_question_id_fkey" FOREIGN KEY (ngl_question_id) REFERENCES ngl_questions(id) not valid;

alter table "public"."notifications" validate constraint "notifications_ngl_question_id_fkey";


