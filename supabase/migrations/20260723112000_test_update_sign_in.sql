DO $$
BEGIN
  UPDATE auth.users SET last_sign_in_at = NOW() WHERE email = 'admin@demo.com';
  UPDATE auth.identities SET last_sign_in_at = NOW() WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@demo.com');
  INSERT INTO public.debug_log (msg) VALUES ('update sign in at successful');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error updating sign in at: ' || SQLERRM);
END;
$$;
