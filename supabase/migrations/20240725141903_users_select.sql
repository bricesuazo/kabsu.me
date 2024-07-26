create policy "Enable select for my data"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));



