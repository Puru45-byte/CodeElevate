import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse CLI args
const email = process.argv[2] || 'admin@codeelevate.com';
const password = process.argv[3] || 'Admin@123456';

console.log('='.repeat(60));
console.log('SUPABASE AUTH DIAGNOSTIC TOOL');
console.log('='.repeat(60));

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
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n--- Environment Check ---');
console.log('NEXT_PUBLIC_SUPABASE_URL is set:', !!supabaseUrl);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY is set:', !!anonKey);
console.log('SUPABASE_SERVICE_ROLE_KEY is set:', !!serviceRoleKey);

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error('Error: Missing required Supabase environment variables in .env.local/.env');
  process.exit(1);
}

// Helper: Decode JWT payload
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

// Extract project ref from URL
function getProjectRefFromUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname; // e.g. abcdefghijklm.supabase.co
    return host.split('.')[0];
  } catch {
    return null;
  }
}

async function runDiagnostics() {
  // Step 1c: Check project ref matching
  console.log('\n--- STEP 1c: Project Ref Verification ---');
  const urlRef = getProjectRefFromUrl(supabaseUrl);
  const anonPayload = decodeJwtPayload(anonKey);
  const servicePayload = decodeJwtPayload(serviceRoleKey);

  console.log('Project Ref from URL:', urlRef || 'UNABLE TO PARSE');
  console.log('Anon Key JWT role:', anonPayload?.role || 'UNKNOWN');
  console.log('Anon Key JWT ref claim:', anonPayload?.ref || 'N/A (no ref claim)');
  console.log('Service Role Key JWT role:', servicePayload?.role || 'UNKNOWN');
  console.log('Service Role Key JWT ref claim:', servicePayload?.ref || 'N/A (no ref claim)');
  
  if (anonPayload?.ref && urlRef && anonPayload.ref !== urlRef) {
    console.log('WARNING: Anon Key ref mismatch with URL ref!');
  } else {
    console.log('Anon Key ref check: OK / Compatible');
  }

  // Step 1a: Health and Settings
  console.log('\n--- STEP 1a: Health & Settings Check ---');
  try {
    const healthRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const healthText = await healthRes.text();
    console.log(`GET /auth/v1/health status: ${healthRes.status} ${healthRes.statusText}`);
    console.log(`GET /auth/v1/health body: ${healthText}`);
  } catch (err) {
    console.error('GET /auth/v1/health failed:', err.message);
  }

  try {
    const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const settingsText = await settingsRes.text();
    console.log(`GET /auth/v1/settings status: ${settingsRes.status} ${settingsRes.statusText}`);
    console.log(`GET /auth/v1/settings body: ${settingsText}`);
  } catch (err) {
    console.error('GET /auth/v1/settings failed:', err.message);
  }

  // Step 1b: Direct Password Token Grant
  console.log('\n--- STEP 1b: Direct POST /auth/v1/token?grant_type=password ---');
  console.log(`Testing authentication for email: ${email}`);
  try {
    const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    const tokenJson = await tokenRes.json().catch(() => null);
    console.log(`HTTP Status: ${tokenRes.status} ${tokenRes.statusText}`);
    if (tokenJson) {
      console.log('Raw JSON Response Body:');
      // Sanitize any returned tokens if login somehow succeeded
      const sanitized = { ...tokenJson };
      if (sanitized.access_token) sanitized.access_token = '[REDACTED_ACCESS_TOKEN]';
      if (sanitized.refresh_token) sanitized.refresh_token = '[REDACTED_REFRESH_TOKEN]';
      console.log(JSON.stringify(sanitized, null, 2));
      console.log('error_code:', tokenJson.error_code || 'none');
      console.log('msg / message / error_description:', tokenJson.msg || tokenJson.message || tokenJson.error_description || tokenJson.error || 'none');
    } else {
      console.log('Response was not JSON or empty');
    }
  } catch (err) {
    console.error('POST /auth/v1/token fetch threw exception:', err.message);
  }

  // Step 1d: Service Role Admin Inspection
  console.log('\n--- STEP 1d: Supabase Admin Inspection for Target User ---');
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('supabaseAdmin.auth.admin.listUsers() ERROR:', listError.status, listError.name, listError.message);
    } else {
      console.log(`Total users found: ${usersData.users.length}`);
      const targetUser = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!targetUser) {
        console.log(`User ${email} was NOT found in auth.users list!`);
        console.log('Available user emails:', usersData.users.map(u => u.email));
      } else {
        console.log(`User found: ${email}`);
        console.log({
          id: targetUser.id,
          email_confirmed_at: targetUser.email_confirmed_at,
          last_sign_in_at: targetUser.last_sign_in_at,
          banned_until: targetUser.banned_until || null,
          app_metadata: targetUser.app_metadata,
          user_metadata: targetUser.user_metadata,
          identities_count: targetUser.identities ? targetUser.identities.length : 0,
          identities: (targetUser.identities || []).map(i => ({
            id: i.id,
            provider: i.provider,
            identity_id: i.identity_id,
            last_sign_in_at: i.last_sign_in_at
          }))
        });

        if (!targetUser.identities || targetUser.identities.length === 0) {
          console.log('CRITICAL: identities array is EMPTY or MISSING!');
        }
      }
    }
  } catch (err) {
    console.error('Service role inspection error:', err);
  }
  console.log('\n' + '='.repeat(60));
}

runDiagnostics();
