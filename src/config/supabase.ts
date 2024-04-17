import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = () => {
  return createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_ANON_KEY ?? '');
};

export default supabase;
