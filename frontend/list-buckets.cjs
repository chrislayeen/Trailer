const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listBuckets() {
    console.log('--- STORAGE BUCKET AUDIT ---');
    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error('Error listing buckets:', error.message);
            return;
        }

        console.log('Buckets found:', buckets.map(b => b.name));

        for (const bucket of buckets) {
            console.log(`Checking bucket: ${bucket.name} (Public: ${bucket.public})`);
            const { data: files, error: fileError } = await supabase.storage.from(bucket.name).list('', { limit: 10 });
            if (fileError) {
                console.log(` - Error listing files: ${fileError.message}`);
            } else {
                console.log(` - Files found: ${files.length}`);
                files.forEach(f => console.log(`   - ${f.name}`));
            }
        }
    } catch (err) {
        console.error(err);
    }
}

listBuckets();
