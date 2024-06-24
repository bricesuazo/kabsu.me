CREATE POLICY "Give users access to own folder 1ufimg_0"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'users' AND (select auth.uid()::text) = (storage.foldername(name))[1]);

alter table "public"."users" drop column "image_path";

alter table "public"."users" add column "image_name" text;


