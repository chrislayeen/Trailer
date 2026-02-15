const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdminRecord() {
    console.log('--- ADMIN RECORD AUDIT ---');
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .ilike('name', 'Admin')
            .eq('role', 'admin');

        if (error) {
            console.error('Error fetching admin record:', error.message);
            return;
        }

        if (data && data.length > 0) {
            console.log('SUCCESS: Admin record found.');
            console.log('Record details:', {
                name: data[0].name,
                role: data[0].role,
                pinMatch: data[0].pin === '836548' ? 'YES' : 'NO'
            });
        } else {
            console.log('FAILED: No record found for "Admin" with role "admin".');
        }
    } catch (err) {
        console.error(err);
    }
}

checkAdminRecord();
