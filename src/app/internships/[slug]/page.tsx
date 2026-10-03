import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInternshipBySlug } from "@/lib/queries/internships";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Globe,
  BookOpen,
  Layers,
  CheckCircle2,
  FileText,
  Award,
  Code2,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export const revalidate = 60;

interface InternshipDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: InternshipDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const internship = await getInternshipBySlug(supabase, slug);

  if (!internship) {
    return { title: "Internship Not Found | CodeElevate" };
  }

  return {
    title: `${internship.title} | ${APP_NAME}`,
    description:
      internship.short_description ||
      internship.description?.slice(0, 160),
  };
}

export default async function InternshipDetailPage({
  params,
}: InternshipDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const internship = await getInternshipBySlug(supabase, slug);

  if (!internship) {
    notFound();
  }

  const iconSrc = internship.icon_url || internship.icon || "/icons/open-book.png";
  const categoryName = internship.category || internship.domain || "Development";
  const techList = internship.technologies || internship.skills || [];
  const modules = internship.modules || [];
  const totalTasks = modules.reduce(
    (sum, m) => sum + (m.tasks?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="container py-4">
          <Link
            href="/internships"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Internships
          </Link>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/60 py-10 md:py-14">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left - Details */}
            <div className="flex-1 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50/80 p-3 shadow-sm ring-1 ring-blue-100">
                  <Image
                    src={iconSrc}
                    alt={internship.title}
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-700 font-medium"
                    >
                      {categoryName}
                    </Badge>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                      FREE
                    </Badge>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {internship.title}
                  </h1>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                {internship.description}
              </p>

              {/* Meta grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {internship.duration_months || 1} Month
                    </p>
                    <p className="text-slate-400">Duration</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Remote</p>
                    <p className="text-slate-400">Mode</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {modules.length} Modules
                    </p>
                    <p className="text-slate-400">Curriculum</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {totalTasks} Tasks
                    </p>
                    <p className="text-slate-400">Milestones</p>
                  </div>
                </div>
              </div>

              {/* Tech badges */}
              {techList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {techList.map((tech: string) => (
                    <span
                      key={tech}
                      className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <Link href={`/apply/${internship.slug}`}>
                <Button
                  size="lg"
                  className="gap-2 font-bold shadow-lg shadow-blue-500/25 mt-2"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Right - Quick Info Card */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  What You&apos;ll Learn
                </h3>
                <ul className="space-y-2.5">
                  {modules.slice(0, 5).map((mod) => (
                    <li
                      key={mod.id}
                      className="flex items-start gap-2 text-xs text-slate-600"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{mod.title}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Certificate</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" /> Included
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Learning Mode</span>
                    <span className="font-bold text-slate-900">
                      Self-Paced
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Level</span>
                    <span className="font-bold text-slate-900">
                      Beginner to Intermediate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-10 md:py-14">
        <div className="container space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Curriculum & Tasks
            </h2>
            <p className="text-xs text-slate-500">
              Complete each module&apos;s tasks in order. Submit your code to GitHub for expert review.
            </p>
          </div>

          <div className="space-y-4">
            {modules.map((mod, modIdx) => {
              const modTasks = mod.tasks || [];
              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm"
                >
                  {/* Module header */}
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 text-xs font-black">
                        {String(modIdx + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {mod.title}
                        </h3>
                        {mod.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {mod.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-600 font-semibold text-xs"
                    >
                      {modTasks.length} Task{modTasks.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {/* Tasks list */}
                  {modTasks.length > 0 && (
                    <div className="divide-y divide-slate-100">
                      {modTasks.map((task, taskIdx) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 text-[10px] font-bold border border-slate-100">
                              {taskIdx + 1}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-800">
                                {task.title}
                              </p>
                              {task.is_required && (
                                <span className="text-[10px] text-red-500 font-medium">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.deadline_days_after_start && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Day {task.deadline_days_after_start}
                              </span>
                            )}
                            <FileText className="h-3.5 w-3.5 text-slate-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="flex justify-center pt-4">
            <Link href={`/apply/${internship.slug}`}>
              <Button
                size="lg"
                className="gap-2 font-bold shadow-lg shadow-blue-500/25"
              >
                Apply for This Internship
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
