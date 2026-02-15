const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
    console.log('--- SCHEMA DISCOVERY ---');
    try {
        // Try to fetch from a generic RPC if it exists (unlikely)
        // Or just try common names
        const tables = ['users', 'user', 'admin', 'admins', 'profiles', 'accounts', 'drivers', 'sessions', 'photos'];

        for (const t of tables) {
            const { error } = await supabase.from(t).select('count').limit(1);
            console.log(`Table "${t}":`, error ? `NOT FOUND (${error.code})` : 'FOUND');
        }
    } catch (err) {
        console.error(err);
    }
}

listTables();
