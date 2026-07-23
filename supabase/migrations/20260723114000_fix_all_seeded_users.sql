DO $$
BEGIN
  -- Recreate admin profile if it was deleted
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  SELECT id, email, 'Admin', 'User', 'admin'
  FROM auth.users
  WHERE email = 'admin@demo.com'
  ON CONFLICT (id) DO NOTHING;

  -- Update auth.users fields to match expected GoTrue schema
  UPDATE auth.users
  SET
    raw_user_meta_data = jsonb_build_object('sub', id, 'email', email, 'email_verified', false, 'phone_verified', false),
    email_change = COALESCE(email_change, ''),
    recovery_token = COALESCE(recovery_token, ''),
    confirmation_token = COALESCE(confirmation_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, '')
  WHERE raw_user_meta_data = '{}'::jsonb OR raw_user_meta_data IS NULL;
  
  -- Delete the test_new_user to keep it clean (optional, but good practice)
  DELETE FROM auth.users WHERE email = 'test_new_user@demo.com';
  
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error fixing all users: ' || SQLERRM);
END;
$$;
