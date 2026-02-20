const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvtwzkqyzujsinwrijal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dHd6a3F5enVqc2lud3JpamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYwNDksImV4cCI6MjA4NjY1MjA0OX0.EPektTpNJLBgqrIm9I7ANIdf1MDSkr2UgL8bos5rv7k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deepList() {
    console.log('--- DEEP STORAGE LIST ---');
    try {
        // 1. List root
        const { data: rootFiles, error: rootError } = await supabase.storage.from('photos').list('');
        if (rootError) {
            console.error('Root List Error:', rootError.message);
        } else {
            console.log(`Root has ${rootFiles.length} items.`);
            for (const f of rootFiles) {
                console.log(` - ${f.name} (${f.id ? 'FILE' : 'FOLDER'})`);
                if (!f.id) { // It's a folder (likely a session ID)
                    const { data: subFiles } = await supabase.storage.from('photos').list(f.name);
                    console.log(`   -> Contents of ${f.name}: ${subFiles?.length || 0} files`);
                    subFiles?.forEach(sf => console.log(`      - ${sf.name}`));
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
}

deepList();
