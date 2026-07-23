DO $$
BEGIN
  UPDATE auth.users SET encrypted_password = '$2a$10$ytn076yI.QnN./o9F3NjTe7Ut1H4qoGkkBmmxslkSmIzze6qW6yIW' WHERE email = 'admin@demo.com';
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_log (msg) VALUES ('Error: ' || SQLERRM);
END;
$$;
