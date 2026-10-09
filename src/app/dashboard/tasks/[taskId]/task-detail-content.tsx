"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Task,
  TaskResource,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Sparkles,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { SubmitInternshipDialog } from "@/components/shared/SubmitInternshipDialog";

interface TaskDetailContentProps {
  task: Task & { module?: any; resources?: TaskResource[] };
  computedStatus?: any;
  submissions?: any[];
  enrollmentId: string;
}

export function TaskDetailContent({
  task,
  enrollmentId,
}: TaskDetailContentProps) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadResource = async (resourceId: string) => {
    setDownloadingId(resourceId);
    try {
      const res = await fetch("/api/resources/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.signedUrl) {
        toast.error(data.error || "Could not retrieve download link");
        return;
      }
      window.open(data.signedUrl, "_blank");
    } catch {
      toast.error("Failed to open resource");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ────────────────── TOP BREADCRUMB ────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Tasks</span>
        </Link>

        {task.module?.title && (
          <span className="text-xs font-semibold text-slate-400">
            {task.module.title}
          </span>
        )}
      </div>

      {/* ────────────────── TASK HEADER CARD ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold text-slate-600">
                Position: #{task.position || 1}
              </Badge>
              {task.is_required && (
                <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50 font-bold">
                  Mandatory Milestone
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {task.title}
            </h1>
          </div>

          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="rounded-xl text-xs font-bold h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit Internship Work →</span>
          </Button>
        </div>
      </div>

      {/* ────────────────── 2 TABS: DESCRIPTION, RESOURCES ────────────────── */}
      <Tabs defaultValue="description" className="space-y-6">
        <TabsList className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm flex h-auto gap-1">
          <TabsTrigger
            value="description"
            className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            <span>Description & Requirements</span>
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            <span>Study Resources</span>
          </TabsTrigger>
        </TabsList>

        {/* ──────── TAB 1: DESCRIPTION & NUMBERED REQUIREMENTS ──────── */}
        <TabsContent value="description" className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Task Overview
              </h3>
              <div className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {task.description}
              </div>
            </div>

            {/* Numbered Requirements */}
            {task.requirements && task.requirements.length > 0 && (
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Deliverable Requirements
                </h3>
                <ol className="space-y-3">
                  {task.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ──────── TAB 2: RESOURCES ──────── */}
        <TabsContent value="resources" className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Learning Materials & Slides
              </h3>
              <p className="text-xs text-slate-500">
                Presentation slides (PPT), reference code snippets, and guides uploaded for this task.
              </p>
            </div>

            {task.resources && task.resources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {task.resources.map((res) => (
                  <div
                    key={res.id || res.title}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {res.type || "PPT/PDF"}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 pt-1 leading-snug">
                        {res.title}
                      </h4>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadResource(res.id!)}
                      disabled={downloadingId === res.id}
                      className="w-full text-xs font-bold rounded-xl h-9 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5 text-blue-600" />
                      <span>
                        {downloadingId === res.id ? "Preparing File..." : "Download / Open Material"}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700">No specific resources attached to this task</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Check the overall &quot;Learning Materials (PPT/PDF)&quot; tab in My Learning for track slide decks.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ────────────────── SUBMISSION DIALOG ────────────────── */}
      <SubmitInternshipDialog
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        enrollmentId={enrollmentId}
        internshipTitle={task.module?.title || task.title}
      />
    </div>
  );
}
