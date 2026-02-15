const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPhotos() {
    console.log('--- STORAGE & PHOTO AUDIT ---');
    try {
        // 1. Check photos table
        const { data: photos, error: photoError } = await supabase
            .from('photos')
            .select('*')
            .limit(5);

        if (photoError) {
            console.error('Photo table error:', photoError.message);
        } else {
            console.log(`Found ${photos.length} photos in DB.`);
            photos.forEach(p => console.log(` - Path: ${p.storage_path}`));
        }

        // 2. Try to get a public URL for the first photo
        if (photos && photos.length > 0) {
            const path = photos[0].storage_path;
            const { data } = supabase.storage.from('photos').getPublicUrl(path);
            console.log('Test Public URL:', data.publicUrl);

            // 3. Optional: Try to list bucket contents (requires storage permissions)
            const { data: list, error: listError } = await supabase
                .storage
                .from('photos')
                .list();

            if (listError) {
                console.log('Bucket list error (Expected if not public):', listError.message);
            } else {
                console.log(`Bucket contains ${list.length} files.`);
            }
        } else {
            console.log('No photos found in DB to test.');
        }

    } catch (err) {
        console.error(err);
    }
}

checkPhotos();
