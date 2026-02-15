import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration is MISSING! Check .env.local file.');
} else {
    console.log('--- SUPABASE INITIALIZATION AUDIT ---');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Project ID Reference:', supabaseUrl.split('//')[1].split('.')[0]);
    console.log('------------------------------------');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
