set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_mention(user_ids text[])
 RETURNS TABLE(id uuid, username text, name text)
 LANGUAGE plpgsql
AS $function$
declare
  user_id uuid;
  user_found boolean;
  user_id_str varchar;
begin
  -- Initialize an empty array to store results
  FOR user_id_str IN SELECT unnest(user_ids) LOOP
    -- Attempt to convert user_id_str to UUID
    BEGIN
      user_id := user_id_str::uuid;
    EXCEPTION
      WHEN others THEN
        -- Handle invalid UUID (skip or log error as needed)
        CONTINUE; -- Skip to next iteration if conversion fails
    END;

    -- Check if user with this ID exists
    user_found := EXISTS (
      SELECT 1 FROM users u WHERE u.id = user_id
    );

    -- If user found, fetch user details and return
    IF user_found THEN
      RETURN QUERY
      SELECT u.id, u.username, u.name FROM users u WHERE u.id = user_id;
    END IF;
  END LOOP;

  -- Return empty if no users found
  RETURN;
END;
$function$
;


