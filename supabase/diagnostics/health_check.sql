-- ========================================================
-- CodeElevate Database & Auth Health Check
-- Single Result Set Diagnostic Query (Read-Only)
-- ========================================================

WITH null_tokens AS (
  SELECT COUNT(*) AS count
  FROM auth.users
  WHERE confirmation_token IS NULL
     OR recovery_token IS NULL
     OR email_change_token_new IS NULL
     OR email_change_token_current IS NULL
     OR email_change IS NULL
     OR phone_change IS NULL
     OR phone_change_token IS NULL
     OR reauthentication_token IS NULL
),
missing_identities AS (
  SELECT COUNT(*) AS count
  FROM auth.users u
  LEFT JOIN auth.identities i ON u.id = i.user_id
  WHERE i.id IS NULL
),
missing_profiles AS (
  SELECT COUNT(*) AS count
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL
),
orphaned_profiles AS (
  SELECT COUNT(*) AS count
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  WHERE u.id IS NULL
),
is_admin_check AS (
  SELECT 
    CASE 
      WHEN pg_get_functiondef(p.oid) LIKE '%public.profiles%' THEN true 
      ELSE false 
    END AS has_recursive_subquery,
    pg_get_functiondef(p.oid) AS definition
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.proname = 'is_admin'
  LIMIT 1
)
SELECT 
  (SELECT count FROM null_tokens) AS users_with_null_token_columns,
  (SELECT count FROM missing_identities) AS users_with_missing_identities,
  (SELECT count FROM missing_profiles) AS users_missing_profiles,
  (SELECT count FROM orphaned_profiles) AS profiles_missing_auth_users,
  coalesce((SELECT has_recursive_subquery FROM is_admin_check), false) AS is_admin_queries_profiles_recursively,
  CASE 
    WHEN (SELECT count FROM null_tokens) = 0
     AND (SELECT count FROM missing_identities) = 0
     AND (SELECT count FROM missing_profiles) = 0
     AND coalesce((SELECT has_recursive_subquery FROM is_admin_check), false) = false
    THEN '✅ HEALTHY: All auth schemas and policies are optimal'
    ELSE '⚠️ ATTENTION REQUIRED: Inconsistencies detected'
  END AS overall_system_health;
