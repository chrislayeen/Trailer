const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runAudit() {
    console.log('--- COMMAND LINE DB AUDIT ---');
    console.log('Project URL:', supabaseUrl);

    try {
        // Test 1: Users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        console.log('Test 1 (users):', userError ? `FAILED: ${userError.message}` : 'SUCCESS');

        // Test 2: Sessions table
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('count')
            .limit(1);

        console.log('Test 2 (sessions):', sessionError ? `FAILED: ${sessionError.message}` : 'SUCCESS');

        if (userError && userError.code === 'PGRST205') {
            console.log('Conclusion: The table "public.users" DOES NOT EXIST in this project.');
        } else if (userError) {
            console.log('Conclusion: Permissions issue or other error.');
        } else {
            console.log('Conclusion: Table exists and is reachable.');
        }
    } catch (err) {
        console.error('Unexpected error during audit:', err);
    }
}

runAudit();
