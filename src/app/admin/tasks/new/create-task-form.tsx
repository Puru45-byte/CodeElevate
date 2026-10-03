"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckSquare,
  Plus,
  Trash2,
  Save,
  Clock,
  ListChecks,
  Paperclip,
  Upload,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Internship, InternshipModule } from "@/types/database";

interface CreateTaskFormProps {
  internships: Internship[];
  modules: InternshipModule[];
  initialInternshipId?: string;
  initialModuleId?: string;
}

export function CreateTaskForm({
  internships,
  modules,
  initialInternshipId,
  initialModuleId,
}: CreateTaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [internshipId, setInternshipId] = useState(
    initialInternshipId || (internships[0]?.id ?? "")
  );
  const [moduleId, setModuleId] = useState(initialModuleId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [isRequired, setIsRequired] = useState(true);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  // Requirements list editor
  const [requirements, setRequirements] = useState<string[]>([
    "Initialize clean project repository with standard architecture",
    "Implement core requirements and edge case handling",
    "Submit public GitHub repository link with documentation",
  ]);
  const [reqInput, setReqInput] = useState("");

  const filteredModules = modules.filter(
    (m) => m.internship_id === internshipId
  );

  const handleAddRequirement = () => {
    if (!reqInput.trim()) return;
    setRequirements([...requirements, reqInput.trim()]);
    setReqInput("");
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internship_id: internshipId,
          module_id: moduleId || null,
          title,
          description,
          requirements,
          deadline_days_after_start: Number(deadlineDays) || 7,
          is_required: isRequired,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create task");

      toast.success("Milestone task created successfully!");
      router.push(`/admin/tasks?internshipId=${internshipId}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/admin/tasks?internshipId=${internshipId}`}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Create Milestone Task
            </h1>
            <p className="text-xs text-slate-500">
              Configure practical deliverable specifications and completion criteria
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 rounded-xl shadow-sm"
        >
          <Save className="w-4 h-4" />
          {loading ? "Creating..." : "Save Task"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600">
              1. Task Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Internship Track <span className="text-red-500">*</span>
                </label>
                <select
                  value={internshipId}
                  onChange={(e) => {
                    setInternshipId(e.target.value);
                    setModuleId("");
                  }}
                  required
                  className="w-full h-10 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  {internships.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Assigned Module
                </label>
                <select
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">(No specific module / General)</option>
                  {filteredModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Task Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Task 1: Environment Setup & Core Logic"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Task Description & Instructions <span className="text-red-500">*</span>
              </label>
              <Textarea
                rows={5}
                placeholder="Detailed explanation of the practical task, steps, and expected outcome..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Requirements List Editor */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                <span>2. Acceptance Requirements List</span>
              </h2>
              <span className="text-xs text-slate-400 font-semibold">
                {requirements.length} item(s)
              </span>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add checklist requirement..."
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
                className="bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
              <Button
                type="button"
                onClick={handleAddRequirement}
                variant="outline"
                className="rounded-xl border-slate-200 text-xs font-bold gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>

            <div className="space-y-2 pt-2">
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 font-medium leading-relaxed">
                      {req}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600">
              Timing & Rules
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Deadline (Days After Start)</span>
              </label>
              <Input
                type="number"
                min="1"
                max="90"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                required
                className="bg-slate-50 border-slate-200 rounded-xl font-medium text-xs"
              />
              <p className="text-[10px] text-slate-400">
                e.g. 7 days for Week 1, 14 days for Week 2
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Required for Certificate
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Must be approved for 100% completion
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600">
              Publishing State
            </h2>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={status === "PUBLISHED"}
                  onChange={() => setStatus("PUBLISHED")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Published</p>
                  <p className="text-[10px] text-slate-500">
                    Live for enrolled students
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={status === "DRAFT"}
                  onChange={() => setStatus("DRAFT")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Draft</p>
                  <p className="text-[10px] text-slate-500">
                    Hidden from student view
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
