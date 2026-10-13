import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { Enrollment, Internship, Application } from "@/types/database";

export interface StudentEnrollmentDetails extends Enrollment {
  internship: Internship;
  course: Internship;
  application?: Application | null;
  certificate?: {
    id: string;
    certificate_number?: string;
    status?: string;
    type?: string;
  } | null;
}

export interface ResolvedEnrollmentResult {
  resolved: StudentEnrollmentDetails | null;
  allEnrollments: StudentEnrollmentDetails[];
  isDefault: boolean;
  isValid: boolean;
  redirectNeeded: boolean;
}

/**
 * Fetches all student enrollments joined with internship, application, and certificate.
 * Ordered oldest first: start_date ascending, then created_at ascending.
 */
export async function getStudentEnrollments(
  userId: string,
  client?: SupabaseClient
): Promise<StudentEnrollmentDetails[]> {
  const supabase = client || (await createClient());

  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      *,
      internship:internships(*),
      application:applications(*),
      certificate:certificates(id, certificate_number, status, type)
    `)
    .eq("user_id", userId)
    .order("start_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching student enrollments:", error);
    return [];
  }

  return (data || []).map((enr: any) => ({
    ...enr,
    course: enr.internship,
    certificate: Array.isArray(enr.certificate) ? enr.certificate[0] || null : enr.certificate || null,
  })) as StudentEnrollmentDetails[];
}

/**
 * Resolves the appropriate enrollment for a student following strict business & security rules:
 * - If requestedId is provided: verifies ownership by userId.
 *   - If valid, returns it (redirectNeeded = false).
 *   - If invalid/not owned, falls back to default and sets redirectNeeded = true.
 * - If requestedId is not provided:
 *   - Chooses the OLDEST ACTIVE enrollment (start_date asc, created_at asc).
 *   - If none active, falls back to the most recent COMPLETED enrollment.
 *   - If no enrollments exist at all, returns resolved = null, redirectNeeded = false.
 *   - When a default is chosen, sets redirectNeeded = true.
 */
export async function resolveEnrollment(
  userId: string,
  requestedId?: string | null,
  client?: SupabaseClient
): Promise<ResolvedEnrollmentResult> {
  const allEnrollments = await getStudentEnrollments(userId, client);

  if (allEnrollments.length === 0) {
    return {
      resolved: null,
      allEnrollments: [],
      isDefault: true,
      isValid: true,
      redirectNeeded: false,
    };
  }

  // Find default enrollment:
  // 1. Oldest ACTIVE enrollment (already ordered oldest first in allEnrollments)
  const oldestActive = allEnrollments.find((e) => e.status === "ACTIVE") || null;

  // 2. If none active, most recent COMPLETED enrollment (sort completed by completed_at desc, created_at desc)
  let fallbackCompleted: StudentEnrollmentDetails | null = null;
  if (!oldestActive) {
    const completedList = allEnrollments.filter((e) => e.status === "COMPLETED");
    if (completedList.length > 0) {
      fallbackCompleted = [...completedList].sort((a, b) => {
        const timeA = new Date(a.completed_at || a.updated_at || a.created_at).getTime();
        const timeB = new Date(b.completed_at || b.updated_at || b.created_at).getTime();
        return timeB - timeA;
      })[0];
    }
  }

  const defaultEnrollment = oldestActive || fallbackCompleted || allEnrollments[0];

  // If a requestedId was provided:
  if (requestedId && typeof requestedId === "string") {
    const matched = allEnrollments.find((e) => e.id === requestedId);
    if (matched) {
      return {
        resolved: matched,
        allEnrollments,
        isDefault: false,
        isValid: true,
        redirectNeeded: false,
      };
    }

    // Security Rule 8: untrusted id did not match any of this student's enrollments
    return {
      resolved: defaultEnrollment,
      allEnrollments,
      isDefault: true,
      isValid: false,
      redirectNeeded: true,
    };
  }

  // No parameter provided (Rule 6): default was selected, redirect is needed so URL reflects enrollment
  return {
    resolved: defaultEnrollment,
    allEnrollments,
    isDefault: true,
    isValid: true,
    redirectNeeded: true,
  };
}
