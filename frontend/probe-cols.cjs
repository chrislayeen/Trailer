const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function probeColumns() {
    console.log('--- COLUMN PROBING ---');
    const cols = ['id', 'name', 'username', 'email', 'pin', 'role', 'created_at', 'full_name'];

    for (const c of cols) {
        const { error } = await supabase.from('users').select(c).limit(1);
        if (error) {
            console.log(`Column "${c}": NOT FOUND (${error.message})`);
        } else {
            console.log(`Column "${c}": FOUND`);
        }
    }
}

probeColumns();
