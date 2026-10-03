-- ========================================================
-- SUPABASE AUTH & DATABASE DIAGNOSTIC SCRIPT
-- Generated for CodeElevate Root-Cause Analysis
-- INSTRUCTIONS: Run this in the Supabase Dashboard SQL Editor
-- All tests are read-only and safe to execute.
-- ========================================================

-- ────────────────────────────────────────────────────────
-- SECTION 1: NON-INTERNAL TRIGGERS (Highlighting auth.* tables)
-- ────────────────────────────────────────────────────────
SELECT 
  n.nspname AS schema_name,
  c.relname AS table_name,
  t.tgname AS trigger_name,
  CASE t.tgenabled 
    WHEN 'O' THEN 'ENABLED' 
    WHEN 'D' THEN 'DISABLED' 
    WHEN 'A' THEN 'ALWAYS' 
    WHEN 'R' THEN 'REPLICA' 
  END AS status,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS trigger_function_definition,
  CASE 
    WHEN n.nspname = 'auth' THEN '⚠️ CRITICAL: AUTH TRIGGER'
    ELSE 'PUBLIC TRIGGER'
  END AS priority_flag
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE NOT t.tgisinternal
  AND n.nspname IN ('public', 'auth', 'storage')
ORDER BY priority_flag DESC, schema_name, table_name;

-- ────────────────────────────────────────────────────────
-- SECTION 2: FUNCTION DEFINITIONS, OWNERS & SEARCH PATHS
-- ────────────────────────────────────────────────────────
SELECT 
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_userbyid(p.proowner) AS function_owner,
  p.prosecdef AS is_security_definer,
  p.proconfig AS search_path_config,
  pg_get_functiondef(p.oid) AS full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname IN ('is_admin', 'handle_new_user', 'check_enrollment_completion', 'approve_task_submission', 'approve_application');

-- ────────────────────────────────────────────────────────
-- SECTION 3: RLS POLICIES & TABLE FLAGS
-- ────────────────────────────────────────────────────────
-- 3A: Table RLS flags
SELECT 
  n.nspname AS schemaname,
  c.relname AS tablename,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_enforced_for_owners
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname IN ('public', 'storage')
  AND c.relkind = 'r'
ORDER BY schemaname, tablename;

-- 3B: All defined policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename, policyname;

-- ────────────────────────────────────────────────────────
-- SECTION 4: auth.users RECORD FOR TARGET ADMIN USER
-- ────────────────────────────────────────────────────────
SELECT 
  id,
  instance_id,
  aud,
  role,
  email,
  email_confirmed_at,
  (encrypted_password IS NOT NULL) AS has_encrypted_password,
  -- Token nullity checks (Critical for GoTrue Go struct scanner)
  (confirmation_token IS NULL) AS confirmation_token_is_null,
  confirmation_token,
  (recovery_token IS NULL) AS recovery_token_is_null,
  recovery_token,
  (email_change_token_new IS NULL) AS email_change_token_new_is_null,
  email_change_token_new,
  (email_change_token_current IS NULL) AS email_change_token_current_is_null,
  email_change_token_current,
  (email_change IS NULL) AS email_change_is_null,
  email_change,
  (phone_change IS NULL) AS phone_change_is_null,
  phone_change,
  (phone_change_token IS NULL) AS phone_change_token_is_null,
  phone_change_token,
  (reauthentication_token IS NULL) AS reauthentication_token_is_null,
  reauthentication_token,
  is_sso_user,
  is_anonymous,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'admin@codeelevate.com';

-- ────────────────────────────────────────────────────────
-- SECTION 5: COUNT OF auth.users ROWS WITH NULL TOKEN STRINGS
-- (GoTrue Go struct scanning fails if string token columns are NULL instead of empty string '')
-- ────────────────────────────────────────────────────────
SELECT 
  COUNT(*) AS total_users_with_null_tokens,
  COUNT(CASE WHEN confirmation_token IS NULL THEN 1 END) AS null_confirmation_token_count,
  COUNT(CASE WHEN recovery_token IS NULL THEN 1 END) AS null_recovery_token_count,
  COUNT(CASE WHEN email_change_token_new IS NULL THEN 1 END) AS null_email_change_token_new_count,
  COUNT(CASE WHEN email_change_token_current IS NULL THEN 1 END) AS null_email_change_token_current_count,
  COUNT(CASE WHEN email_change IS NULL THEN 1 END) AS null_email_change_count,
  COUNT(CASE WHEN phone_change IS NULL THEN 1 END) AS null_phone_change_count,
  COUNT(CASE WHEN phone_change_token IS NULL THEN 1 END) AS null_phone_change_token_count,
  COUNT(CASE WHEN reauthentication_token IS NULL THEN 1 END) AS null_reauthentication_token_count
FROM auth.users;

-- ────────────────────────────────────────────────────────
-- SECTION 6: auth.identities ROWS AND ORPHANED USERS
-- ────────────────────────────────────────────────────────
-- 6A: Identities for admin@codeelevate.com
SELECT 
  i.id AS identity_id,
  i.user_id,
  i.provider,
  i.provider_id,
  i.identity_data,
  i.last_sign_in_at,
  i.created_at,
  i.updated_at
FROM auth.identities i
JOIN auth.users u ON i.user_id = u.id
WHERE u.email = 'admin@codeelevate.com';

-- 6B: Users missing an auth.identities row
SELECT 
  u.id AS user_id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE i.id IS NULL;

-- ────────────────────────────────────────────────────────
-- SECTION 7: PROFILES VS AUTH.USERS INTEGRITY
-- ────────────────────────────────────────────────────────
-- 7A: Profiles row for admin
SELECT 
  p.*
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@codeelevate.com';

-- 7B: auth.users without profiles
SELECT 
  u.id AS auth_user_id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 7C: profiles without auth.users
SELECT 
  p.id AS profile_id,
  p.email,
  p.student_id,
  p.role
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- ────────────────────────────────────────────────────────
-- SECTION 8: SCHEMA & TABLE PRIVILEGES
-- ────────────────────────────────────────────────────────
-- 8A: Schema usage privileges
SELECT 
  r.rolname AS role_name,
  has_schema_privilege(r.rolname, 'public', 'USAGE') AS has_public_usage,
  has_schema_privilege(r.rolname, 'public', 'CREATE') AS has_public_create,
  has_schema_privilege(r.rolname, 'auth', 'USAGE') AS has_auth_usage
FROM pg_roles r
WHERE r.rolname IN ('supabase_auth_admin', 'authenticated', 'anon', 'service_role', 'postgres');

-- 8B: Table privileges on public.profiles
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND grantee IN ('supabase_auth_admin', 'authenticated', 'anon', 'service_role', 'postgres');

-- 8C: Role search_path configurations
SELECT 
  r.rolname,
  r.rolconfig
FROM pg_roles r
WHERE r.rolname IN ('supabase_auth_admin', 'authenticated', 'anon', 'service_role', 'postgres');

-- ────────────────────────────────────────────────────────
-- SECTION 9: SIMULATED PERMISSION & RECURSION TESTS (SAFE DO BLOCKS)
-- ────────────────────────────────────────────────────────
DO $$
DECLARE
  v_admin_id uuid;
  v_count int;
  v_is_adm boolean;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@codeelevate.com' LIMIT 1;
  RAISE NOTICE '>>> STARTING DIAGNOSTIC SIMULATION TESTS <<<';

  -- Test 9A: supabase_auth_admin querying public.profiles
  BEGIN
    SET LOCAL ROLE supabase_auth_admin;
    SELECT COUNT(*) INTO v_count FROM public.profiles;
    RAISE NOTICE 'TEST 9A (supabase_auth_admin select profiles): SUCCESS - Found % profiles', v_count;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST 9A FAILED! Error [%]: %', SQLSTATE, SQLERRM;
  END;

  RESET ROLE;

  -- Test 9B: Authenticated admin checking is_admin() and querying profiles
  IF v_admin_id IS NOT NULL THEN
    BEGIN
      SET LOCAL ROLE authenticated;
      EXECUTE format('SET LOCAL "request.jwt.claims" = ''{"sub":"%s","role":"authenticated"}''', v_admin_id);
      
      -- Test is_admin()
      BEGIN
        SELECT public.is_admin() INTO v_is_adm;
        RAISE NOTICE 'TEST 9B-1 (is_admin function): SUCCESS - Returned %', v_is_adm;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'TEST 9B-1 FAILED (is_admin recursion/error)! Error [%]: %', SQLSTATE, SQLERRM;
      END;

      -- Test profile select
      BEGIN
        SELECT COUNT(*) INTO v_count FROM public.profiles;
        RAISE NOTICE 'TEST 9B-2 (authenticated select profiles): SUCCESS - Read % profiles', v_count;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'TEST 9B-2 FAILED (profiles RLS error)! Error [%]: %', SQLSTATE, SQLERRM;
      END;

    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'TEST 9B SETUP FAILED! Error [%]: %', SQLSTATE, SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'TEST 9B SKIPPED: admin@codeelevate.com does not exist in auth.users';
  END IF;

  RESET ROLE;
  RAISE NOTICE '>>> DIAGNOSTIC SIMULATION TESTS COMPLETED <<<';
END $$;

-- ────────────────────────────────────────────────────────
-- SECTION 10: MIGRATION REFLECTION COMPARISON
-- ────────────────────────────────────────────────────────
SELECT 
  p.proname AS function_name,
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%raw_user_meta_data%' 
    THEN 'NEW (Reads auth metadata - Non-recursive)'
    WHEN pg_get_functiondef(p.oid) LIKE '%public.profiles%' 
    THEN 'OLD (Queries public.profiles - RECURSIVE HAZARD)'
    ELSE 'UNKNOWN/OTHER'
  END AS live_implementation_state
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname = 'is_admin';

-- ────────────────────────────────────────────────────────
-- SECTION 11: COLUMN EXISTENCE AUDIT ON public.profiles
-- ────────────────────────────────────────────────────────
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
