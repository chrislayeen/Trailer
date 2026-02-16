const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function globalSearch() {
    console.log('--- GLOBAL STORAGE SEARCH ---');
    try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
            console.error('Bucket list error:', bucketError.message);
            return;
        }

        console.log(`Found ${buckets.length} buckets: ${buckets.map(b => b.name).join(', ')}`);

        for (const bucket of buckets) {
            const { data: files } = await supabase.storage.from(bucket.name).list('', { limit: 10 });
            console.log(`Bucket [${bucket.name}] has ${files?.length || 0} top-level items.`);
            files?.forEach(f => console.log(` - ${f.name}`));
        }
    } catch (err) {
        console.error(err);
    }
}

globalSearch();
