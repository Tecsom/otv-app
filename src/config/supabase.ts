import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = () => {
  return createClient( 'https://ysbttwpoacgzbospykzx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYnR0d3BvYWNnemJvc3B5a3p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMjc4MTAxNywiZXhwIjoyMDI4MzU3MDE3fQ.ni_jrH8v7N6NXjKGTvDlUdqdN59KwQJiKsonduLJ2FY');
};

export default supabase;
