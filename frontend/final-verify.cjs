const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAccess() {
    console.log('--- FINAL IMAGE ACCESS VERIFICATION ---');
    try {
        const { data: photos, error } = await supabase.from('photos').select('storage_path').limit(1);
        if (error) {
            console.error('Database Error:', error.message);
            return;
        }

        if (photos && photos.length > 0) {
            const path = photos[0].storage_path;
            const { data } = supabase.storage.from('photos').getPublicUrl(path);
            const url = data.publicUrl;
            console.log(`Testing URL: ${url}`);

            https.get(url, (res) => {
                console.log(`HTTP Status: ${res.statusCode}`);
                if (res.statusCode === 200) {
                    console.log('✅ SUCCESS: Image is publicly accessible!');
                } else {
                    console.log(`❌ FAILED: Received ${res.statusCode}. Check policies.`);
                }
            }).on('error', (e) => {
                console.error(`Fetch Error: ${e.message}`);
            });
        } else {
            console.log('No photos found in DB to test.');
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

verifyAccess();
