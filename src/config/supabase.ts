import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// const supabase = () => {
//   return createClient(
//     'https://ysbttwpoacgzbospykzx.supabase.co',
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYnR0d3BvYWNnemJvc3B5a3p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMjc4MTAxNywiZXhwIjoyMDI4MzU3MDE3fQ.ni_jrH8v7N6NXjKGTvDlUdqdN59KwQJiKsonduLJ2FY'
//   );
// }; //! PRODUCTION
const supabase = () => {
    return createClient(
        'https://isakoghkxsbhcucujbfk.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzYWtvZ2hreHNiaGN1Y3VqYmZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUyNDYzNSwiZXhwIjoyMDU5MTAwNjM1fQ.zWaCa8SoMa8blpQ9BZpx4aSRdfgFSq6vw1z9zaaBQls'
    );
}; //! SANDBOX

// export const JWT_SECRET = 'vc502qBBuj7Mp3O03gsb/DI6WI/pvosD8QtS8TkhMxwoa0PyhQ2DRTTnoAbfkUnXWdW+PoU4pEynkkxhZOC2YA=='; //! PRODUCTION
export const JWT_SECRET = 'cC+tfXV9UpX6CSfQaGu0KSzrWrM/XOqP0R4EhGAPMwkMdspOLeYKDfFnJvFX068r/dmp5Mm34VEZ5t1HYjBjpA=='; //! SANDBOX

export default supabase;
