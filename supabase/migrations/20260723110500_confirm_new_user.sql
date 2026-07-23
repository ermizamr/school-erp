DO $$
BEGIN
  UPDATE auth.users SET email_confirmed_at = current_timestamp WHERE email = 'test_new_user@demo.com';
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error: ' || SQLERRM);
END;
$$;
