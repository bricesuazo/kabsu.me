set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_user(user_id uuid, email text, created_at timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  declare
  encrypted_pw text;
BEGIN
  encrypted_pw := extensions.crypt(user_id::text, extensions.gen_salt('bf')::text);
  
  INSERT INTO auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', email, encrypted_pw, created_at, created_at, created_at, '{"provider":"email","providers":["email"]}', '{}', created_at, created_at, '', '', '', '');
  
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), user_id, user_id, format('{"sub":"%s","email":"%s"}', user_id::text, email)::jsonb, 'email', created_at, created_at, created_at);

  RETURN user_id;
END;
$function$
;


