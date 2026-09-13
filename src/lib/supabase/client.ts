import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Conditionally create client so it doesn't crash the browser if keys are hidden
export const supabaseDbClient = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
