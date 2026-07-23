const fs = require('fs');
const file = 'supabase/migrations/20260722005400_complete_backend.sql';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('get_my_role()')) {
  const funcDef = `
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

`;
  content = funcDef + content;
  content = content.replace(/auth\.jwt\(\) ->> 'role'/g, 'public.get_my_role()');
  fs.writeFileSync(file, content);
  console.log('Fixed complete_backend.sql');
} else {
  console.log('Already fixed');
}
