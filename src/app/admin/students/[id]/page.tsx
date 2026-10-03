import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Calendar,
  FileText,
  BookOpen,
  CheckSquare,
  CreditCard,
  Award,
  ExternalLink,
  CheckCircle2,
  Hourglass,
  AlertCircle,
  Github,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: StudentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, student_id")
    .eq("id", id)
    .maybeSingle();

  return {
    title: `${profile?.first_name || "Student"} (${profile?.student_id || "Profile"}) | Admin`,
  };
}

export default async function AdminStudentDetailPage({
  params,
}: StudentDetailPageProps) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch student profile, applications, enrollments, submissions, payments, certificates
  const [
    { data: student },
    { data: applications },
    { data: enrollments },
    { data: submissions },
    { data: payments },
    { data: certificates },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("applications").select("*, internship:internships(title)").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("enrollments").select("*, internship:internships(title)").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("task_submissions").select("*, task:tasks(title)").eq("user_id", id).order("submitted_at", { ascending: false }),
    supabase.from("payments").select("*, task:tasks(title)").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("certificates").select("*, internship:internships(title)").eq("user_id", id).order("issued_at", { ascending: false }),
  ]);

  if (!student) {
    notFound();
  }

  const fullName =
    `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
    student.full_name ||
    "Student";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/admin/students"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Student Roster</span>
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
          {student.photo_url ? (
            <Image
              src={student.photo_url}
              alt={fullName}
              fill
              className="object-cover"
            />
          ) : (
            <UserIcon className="h-10 w-10 text-slate-400" />
          )}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-slate-900">{fullName}</h1>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-mono font-bold text-xs">
              {student.student_id || "CE2026"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">{student.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="applications" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Applications ({(applications || []).length})
          </TabsTrigger>
          <TabsTrigger value="enrollments" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Enrollments ({(enrollments || []).length})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Submissions ({(submissions || []).length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Payments ({(payments || []).length})
          </TabsTrigger>
          <TabsTrigger value="certificates" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Certificates ({(certificates || []).length})
          </TabsTrigger>
        </TabsList>

        {/* ──────── TAB 1: OVERVIEW ──────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Contact & Identity
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-semibold">+91 {student.phone || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">WhatsApp:</span>
                  <span className="font-semibold">{student.whatsapp ? `+91 ${student.whatsapp}` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gender:</span>
                  <span className="font-semibold">{student.gender || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="font-semibold">{student.date_of_birth || "—"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Academic & Address
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">College:</span>
                  <span className="font-semibold line-clamp-1">{student.college || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Degree & Dept:</span>
                  <span className="font-semibold">{student.degree || "—"} ({student.department || "—"})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Passout Year:</span>
                  <span className="font-semibold">{student.passout_year || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold">{student.city || ""}, {student.state || ""}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ──────── TAB 2: APPLICATIONS ──────── */}
        <TabsContent value="applications">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            {(applications || []).length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No applications on record.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications?.map((app: any) => (
                  <div key={app.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{app.internship?.title}</p>
                      <p className="text-[11px] text-slate-400">Applied: {formatDate(app.created_at)}</p>
                    </div>
                    <Badge variant="outline" className="font-bold text-xs">{app.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ──────── TAB 3: ENROLLMENTS ──────── */}
        <TabsContent value="enrollments">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            {(enrollments || []).length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No active or completed enrollments.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {enrollments?.map((enr: any) => (
                  <div key={enr.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{enr.internship?.title}</p>
                      <p className="text-[11px] text-slate-400">{enr.start_date} to {enr.end_date}</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs">
                      {enr.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ──────── TAB 4: SUBMISSIONS ──────── */}
        <TabsContent value="submissions">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            {(submissions || []).length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No submissions found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {submissions?.map((sub: any) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{sub.task?.title}</p>
                      <a href={sub.github_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline">
                        {sub.github_url}
                      </a>
                    </div>
                    <Badge variant="outline" className="font-bold text-xs">{sub.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ──────── TAB 5: PAYMENTS ──────── */}
        <TabsContent value="payments">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            {(payments || []).length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No payment records found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {payments?.map((p: any) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{p.task?.title || "Task Review"}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Order: {p.razorpay_order_id}</p>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">₹{(p.amount_paise || 9900) / 100}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ──────── TAB 6: CERTIFICATES ──────── */}
        <TabsContent value="certificates">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            {(certificates || []).length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No certificates issued.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {certificates?.map((c: any) => (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{c.internship?.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono">ID: {c.certificate_number}</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs">
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
