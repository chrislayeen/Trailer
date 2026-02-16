const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function latestPhotos() {
    console.log('--- LATEST PHOTOS AUDIT ---');
    try {
        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .order('taken_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error:', error.message);
        } else {
            console.log(`Found ${data.length} recent photos.`);
            data.forEach(p => {
                console.log(` - ID: ${p.id}, Path: ${p.storage_path}, Taken: ${p.taken_at}`);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

latestPhotos();
