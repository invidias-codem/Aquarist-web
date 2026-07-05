import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function confirmAll() {
  console.log('Fetching users...');
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }
  
  const users = data.users || [];
  console.log(`Found ${users.length} users.`);
  
  for (const user of users) {
    if (!user.email_confirmed_at) {
      console.log(`Confirming user: ${user.email} (ID: ${user.id})`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
      if (updateError) {
        console.error(`Error confirming ${user.email}:`, updateError);
      } else {
        console.log(`Successfully confirmed ${user.email}`);
      }
    } else {
      console.log(`User ${user.email} is already confirmed.`);
    }
  }
  console.log('Done!');
  process.exit(0);
}

confirmAll();
