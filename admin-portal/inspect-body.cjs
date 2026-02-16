const https = require('https');

const url = 'https://jvtwzkqyzujsinwrijal.supabase.co/storage/v1/object/public/photos/5c88b2e8-5601-4bcb-91f0-332745fe3ee2/1771148333727.jpg';

console.log('--- STORAGE BODY INSPECTOR ---');
console.log('Fetching:', url);

https.get(url, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:');
        console.log(body);
        if (body.includes('Invalid Request')) {
            console.log('\nDIAGNOSIS: Supabase returns 400 for "Invalid Request" when the bucket is missing or the path is malformed.');
        }
    });
}).on('error', (e) => {
    console.error('Network Error:', e.message);
});
