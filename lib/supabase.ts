
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials missing in lib/supabase.ts!", { supabaseUrl, supabaseKey });
}

export const supabase = createClient(supabaseUrl, supabaseKey);
