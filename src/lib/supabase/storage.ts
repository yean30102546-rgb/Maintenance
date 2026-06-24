import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with storage
export const supabaseStorage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
