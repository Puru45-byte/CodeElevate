/**
 * scripts/confirm-users.mjs
 *
 * Lists auth users whose email has NOT been confirmed.
 * With --apply flag, confirms them via the admin API.
 *
 * Usage:
 *   node scripts/confirm-users.mjs           # dry-run: print unconfirmed users
 *   node scripts/confirm-users.mjs --apply   # confirm each unconfirmed user
 *
 * Safety rules:
 *   - Never prints secret keys or passwords.
 *   - Prints only email and created_at for unconfirmed users.
 *   - Without --apply, it is a 100% read-only dry-run.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");

// ─── Load env (never print values) ────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function loadEnv() {
  const envPaths = [".env.local", ".env"];
  const env = {};
  for (const p of envPaths) {
    const fullPath = fs.existsSync(path.resolve(process.cwd(), p)) ? path.resolve(process.cwd(), p) : path.resolve(projectRoot, p);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const k = trimmed.substring(0, idx).trim();
          let v = trimmed.substring(idx + 1).trim();
          if (
            (v.startsWith('"') && v.endsWith('"')) ||
            (v.startsWith("'") && v.endsWith("'"))
          ) {
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

console.log("=".repeat(60));
console.log("CONFIRM-USERS  --  Unconfirmed Email Report");
console.log("=".repeat(60));
console.log("Mode:", APPLY ? "APPLY (will confirm users)" : "DRY-RUN (read-only)");
console.log();

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in .env / .env.local"
  );
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  });

  if (error) {
    console.error("ERROR listing users:", error.message);
    process.exit(1);
  }

  const unconfirmed = (data?.users ?? []).filter(
    (u) => !u.email_confirmed_at
  );

  if (unconfirmed.length === 0) {
    console.log("All users are confirmed. Nothing to do.");
    return;
  }

  console.log(`Found ${unconfirmed.length} unconfirmed user(s):\n`);
  console.log(
    unconfirmed
      .map(
        (u) =>
          `  email: ${u.email ?? "(no email)"}  |  created_at: ${u.created_at}`
      )
      .join("\n")
  );
  console.log();

  if (!APPLY) {
    console.log(
      "Dry-run complete. Run with --apply to confirm these users."
    );
    return;
  }

  // ── Apply: confirm each user ──────────────────────────────────────────────
  console.log("Applying confirmations...\n");
  let confirmed = 0;
  let failed = 0;

  for (const u of unconfirmed) {
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(u.id, {
        email_confirm: true,
      });

    if (updateError) {
      console.error(`  FAILED  ${u.email ?? u.id}: ${updateError.message}`);
      failed++;
    } else {
      console.log(`  OK      ${u.email ?? u.id}`);
      confirmed++;
    }
  }

  console.log();
  console.log(
    `Done. Confirmed: ${confirmed}  Failed: ${failed}`
  );
}

run().catch((err) => {
  console.error("Unexpected error:", err.message);
  process.exit(1);
});
