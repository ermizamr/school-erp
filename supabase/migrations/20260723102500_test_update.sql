DO $$
BEGIN
  UPDATE auth.users SET last_sign_in_at = now() WHERE email = 'admin@demo.com';
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error updating auth.users: ' || SQLERRM);
END;
$$;
