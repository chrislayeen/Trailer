const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function touchBucket() {
    console.log('--- BUCKET TOUCH TEST ---');
    try {
        const { data, error } = await supabase.storage
            .from('photos')
            .upload('touch-test.txt', 'HELLO', { upsert: true });

        if (error) {
            console.log('Touch Failed:', error.message);
            console.log('Error Code:', error.statusCode || error.status);
            if (error.message.includes('not found')) {
                console.log('DIAGNOSIS: Bucket "photos" does NOT exist in this project.');
            }
        } else {
            console.log('✅ Touch Success! Bucket "photos" exists and is writable.');
        }
    } catch (err) {
        console.error(err);
    }
}

touchBucket();
