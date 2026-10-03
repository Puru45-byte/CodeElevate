# 🐘 CodeElevate Supabase Database Migrations

This folder contains the complete, production-ready SQL migrations for the **CodeElevate** ed-tech platform.

---

## 🚀 Migration Run Order

Run each SQL file **in numerical order** directly in your **Supabase Dashboard → SQL Editor**:

| Step | Migration File | Description |
| :---: | :--- | :--- |
| **1** | [`001_schema.sql`](file:///p:/project/CodeElevate/supabase/migrations/001_schema.sql) | Extensions, custom `ENUM` types, sequences, all 14 core tables, foreign keys, constraints, and composite indexes. |
| **2** | [`002_rls.sql`](file:///p:/project/CodeElevate/supabase/migrations/002_rls.sql) | Row Level Security (RLS) policies on every table with role separation (`student` vs `admin` via `is_admin()`). |
| **3** | [`003_functions.sql`](file:///p:/project/CodeElevate/supabase/migrations/003_functions.sql) | Atomic functions and triggers: `handle_new_user`, `next_certificate_number`, `get_task_statuses`, `get_enrollment_progress`, `approve_application`, `check_enrollment_completion`, and notification triggers. |
| **4** | [`004_storage.sql`](file:///p:/project/CodeElevate/supabase/migrations/004_storage.sql) | Supabase Storage buckets (`profile-photos`, `course-images`, `logos`, `course-materials`, `task-resources`, `certificates`) and security policies. |
| **5** | [`005_seed.sql`](file:///p:/project/CodeElevate/supabase/migrations/005_seed.sql) | 14 published internships with icons, detailed 4-week Python curriculum with tasks, default certificate template, and automatic curriculum cloner. |

---

## 🛠️ Step-by-Step Instructions

1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor** on the left navigation bar.
3. Open or copy the contents of [`001_schema.sql`](file:///p:/project/CodeElevate/supabase/migrations/001_schema.sql) into a new query window and click **Run**.
4. Repeat for [`002_rls.sql`](file:///p:/project/CodeElevate/supabase/migrations/002_rls.sql), [`003_functions.sql`](file:///p:/project/CodeElevate/supabase/migrations/003_functions.sql), [`004_storage.sql`](file:///p:/project/CodeElevate/supabase/migrations/004_storage.sql), and [`005_seed.sql`](file:///p:/project/CodeElevate/supabase/migrations/005_seed.sql).

---

## 👑 Promoting a User to Admin

After signing up via the platform interface, promote your user to Admin by running:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

---

## 🔒 Key Database Rules Enforced

- **Fixed Review Fee**: The database schema and server handle the ₹99 (`9900` paise) fee without exposing or accepting amounts from client code.
- **Auto Duration**: Every enrollment and application defaults to exactly 1 month (`current_date` to `current_date + 1 month - 1 day`).
- **Sequential Task Unlocks**: `get_task_statuses(enrollment_id)` calculates whether tasks are `AVAILABLE` or `LOCKED` directly inside PostgreSQL based on milestone prerequisites.
- **Computed Progress**: `get_enrollment_progress(enrollment_id)` calculates progress percentage dynamically inside the database.
