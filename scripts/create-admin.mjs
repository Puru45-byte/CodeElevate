import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse arguments
const email = process.argv[2];
const password = process.argv[3];
const firstName = process.argv[4] || 'Admin';
const lastName = process.argv[5] || 'User';

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password> [firstName] [lastName]');
  process.exit(1);
}

// Load .env.local or .env
function loadEnv() {
  const envPaths = ['.env.local', '.env'];
  const env = {};
  for (const p of envPaths) {
    const fullPath = path.resolve(process.cwd(), p);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const k = trimmed.substring(0, idx).trim();
          let v = trimmed.substring(idx + 1).trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.substring(1, v.length - 1);
          }
          if (!env[k]) env[k] = v;
        }
      });
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env/.env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  console.log(`Checking if user ${email} already exists...`);

  // 1. Check existing users
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Error querying auth users:', listError.message);
    process.exit(1);
  }

  const existing = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    console.warn(`User with email "${email}" already exists (ID: ${existing.id}).`);
    console.warn('Refusing to create duplicate user. If this user is an admin, ensure public.profiles has role = "admin".');
    process.exit(0);
  }

  // 2. Create the user cleanly via official Auth Admin API
  console.log(`Creating admin user "${email}" via Supabase Auth Admin API...`);
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: password,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim()
    },
    app_metadata: {
      role: 'admin'
    }
  });

  if (createError || !newUser.user) {
    console.error('Failed to create admin user:', createError?.message || 'Unknown error');
    process.exit(1);
  }

  const userId = newUser.user.id;

  // 3. Upsert matching public.profiles row
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const studentId = `CE-ADMIN-${randomSuffix}`;

  const { error: profileError } = await supabaseAdmin.from('profiles').upsert(
    {
      id: userId,
      student_id: studentId,
      role: 'admin',
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim(),
      email: email.trim().toLowerCase(),
      updated_at: new Date().toISOString()
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    console.warn('Warning: Auth user was created but profile upsert returned:', profileError.message);
  } else {
    console.log(`Admin profile successfully linked with role = "admin".`);
  }

  console.log(`\n Admin user "${email}" created successfully!`);
  console.log(`Login at: http://localhost:3000/login`);
}

createAdmin().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
