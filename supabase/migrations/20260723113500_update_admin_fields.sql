DO $$
BEGIN
  UPDATE auth.users
  SET
    raw_user_meta_data = jsonb_build_object('sub', id, 'email', email, 'email_verified', false, 'phone_verified', false),
    email_change = COALESCE(email_change, ''),
    recovery_token = COALESCE(recovery_token, ''),
    confirmation_token = COALESCE(confirmation_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, '')
  WHERE email = 'admin@demo.com';
  
  INSERT INTO public.debug_log (msg) VALUES ('updated admin user fields');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error: ' || SQLERRM);
END;
$$;
