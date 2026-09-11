const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// We need dotenv to load the local env file
// But since the project doesn't have dotenv, we can just parse it manually
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1]] = match[2];
      }
    });
  }
}
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  const dataPath = path.join(__dirname, '../data/bookings.json');
  if (!fs.existsSync(dataPath)) {
    console.log('No local data found at', dataPath);
    return;
  }
  
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const bookings = JSON.parse(raw);
  
  if (bookings.length === 0) {
    console.log('Local data is empty.');
    return;
  }
  
  console.log(`Found ${bookings.length} local bookings. Migrating to Supabase...`);
  
  const { data, error } = await supabase.from('bookings').insert(bookings);
  
  if (error) {
    console.error('Migration failed:', error);
  } else {
    console.log('Migration successful! All local data uploaded to Supabase.');
  }
}

migrate();
