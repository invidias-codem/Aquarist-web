import { createClient } from '@supabase/supabase-js';

// We'll use the default local development Supabase URL/anon key for now.
// In a real environment, these would come from import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmF1bHQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5NjM0MTU0NSwiZXhwIjoyMDExOTA1NTQ1fQ.Xo00pC6Y8U0Y0mI-B8eX_V40R_Xw65T1Xo00pC6Y8U0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
