CREATE TABLE auth_lockouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  failed_attempts int NOT NULL DEFAULT 0,
  locked_until timestamptz
);

-- Allow anon to call these functions
GRANT ALL ON TABLE auth_lockouts TO anon, authenticated;

CREATE OR REPLACE FUNCTION check_lockout(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec record;
BEGIN
  SELECT * INTO rec FROM auth_lockouts WHERE email = user_email;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF rec.locked_until > now() THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION record_failed_login(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec record;
BEGIN
  SELECT * INTO rec FROM auth_lockouts WHERE email = user_email;
  IF NOT FOUND THEN
    INSERT INTO auth_lockouts (email, failed_attempts) VALUES (user_email, 1);
  ELSE
    IF rec.locked_until > now() THEN
      -- Already locked out, do nothing
      RETURN;
    END IF;
    
    IF rec.failed_attempts + 1 >= 5 THEN
      UPDATE auth_lockouts 
      SET failed_attempts = rec.failed_attempts + 1,
          locked_until = now() + interval '15 minutes'
      WHERE email = user_email;
    ELSE
      UPDATE auth_lockouts 
      SET failed_attempts = rec.failed_attempts + 1
      WHERE email = user_email;
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION clear_failed_logins(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth_lockouts WHERE email = user_email;
END;
$$;
