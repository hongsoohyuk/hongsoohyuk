import {createClient} from '@supabase/supabase-js';

export const supabase = createClient(process.env.GUESTBOOK_SUPABASE_URL!, process.env.GUESTBOOK_SUPABASE_ANON_KEY!);

export const supabaseAdmin = createClient(
  process.env.GUESTBOOK_SUPABASE_URL!,
  process.env.GUESTBOOK_SUPABASE_SERVICE_ROLE_KEY!,
  {auth: {persistSession: false}},
);
