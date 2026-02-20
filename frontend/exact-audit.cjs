const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exactPathAudit() {
    console.log('--- EXACT PATH AUDIT ---');
    try {
        const { data: photos, error } = await supabase.from('photos').select('storage_path').limit(1);
        if (error) {
            console.error('Error:', error.message);
            return;
        }

        if (photos && photos.length > 0) {
            const path = photos[0].storage_path;
            console.log(`FOUND_PATH: [${path}]`);

            const { data } = supabase.storage.from('photos').getPublicUrl(path);
            console.log(`PUBLIC_URL: [${data.publicUrl}]`);

            // Check if the file is actually reachable via HTTP
            try {
                const fetch = (await import('node-fetch')).default;
                const res = await fetch(data.publicUrl, { method: 'HEAD' });
                console.log(`HTTP_STATUS: ${res.status}`);
            } catch (e) {
                console.log(`FETCH_ERROR: ${e.message}`);
            }
        } else {
            console.log('NO_PHOTOS_FOUND');
        }
    } catch (err) {
        console.error(err);
    }
}

exactPathAudit();
