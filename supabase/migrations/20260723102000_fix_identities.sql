INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    id,
    id,
    jsonb_build_object('sub', id, 'email', email),
    'email',
    created_at,
    created_at,
    updated_at
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities i WHERE i.user_id = auth.users.id
);
