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
  ExternalLink,
  Presentation,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Internship, InternshipModule, Task } from "@/types/database";

interface EditTaskFormProps {
  task: Task & {
    internship?: Internship;
    module?: InternshipModule;
    resources?: any[];
  };
  internships: Internship[];
  modules: InternshipModule[];
}

export function EditTaskForm({
  task,
  internships,
  modules,
}: EditTaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [internshipId, setInternshipId] = useState(task.internship_id);
  const [moduleId, setModuleId] = useState(task.module_id || "");
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [deadlineDays, setDeadlineDays] = useState(
    task.deadline_days_after_start || 7
  );
  const [isRequired, setIsRequired] = useState(task.is_required ?? true);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    (task.status as any) || "PUBLISHED"
  );

  // Requirements
  const [requirements, setRequirements] = useState<string[]>(
    task.requirements || []
  );
  const [reqInput, setReqInput] = useState("");

  // Resources
  const [resources, setResources] = useState<any[]>(task.resources || []);
  const [resTitle, setResTitle] = useState("");
  const [resType, setResType] = useState<"PPT" | "PDF" | "LINK">("LINK");
  const [resFilePath, setResFilePath] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [addingResource, setAddingResource] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${task.id}/${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;

      const { data, error } = await supabase.storage
        .from("task-resources")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      setResFilePath(fileName);
      setResTitle(file.name.replace(`.${fileExt}`, ""));
      if (fileExt?.toLowerCase() === "pdf") {
        setResType("PDF");
      } else if (
        fileExt?.toLowerCase() === "ppt" ||
        fileExt?.toLowerCase() === "pptx"
      ) {
        setResType("PPT");
      }
      toast.success("File uploaded to task-resources bucket!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resFilePath.trim()) {
      toast.error("Resource title and URL / path are required.");
      return;
    }

    setAddingResource(true);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resTitle,
          type: resType,
          file_path: resFilePath,
          module_id: moduleId || null,
          position: resources.length + 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add resource");

      setResources([...resources, data.resource]);
      setResTitle("");
      setResFilePath("");
      toast.success("Resource attached!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save resource");
    } finally {
      setAddingResource(false);
    }
  };

  const handleDeleteResource = async (resId: string) => {
    try {
      const res = await fetch(
        `/api/admin/tasks/${task.id}/resources?resourceId=${resId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete resource");

      setResources(resources.filter((r) => r.id !== resId));
      toast.success("Resource removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "PUT",
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
      if (!res.ok) throw new Error(data.error || "Failed to update task");

      toast.success("Task updated successfully!");
      router.push(`/admin/tasks?internshipId=${internshipId}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete task "${task.title}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      toast.success("Task deleted.");
      router.push(`/admin/tasks?internshipId=${internshipId}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
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
              Edit Milestone Task
            </h1>
            <p className="text-xs text-slate-500">
              {task.internship?.title || "Track"} · Position {task.position}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>

          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 rounded-xl shadow-sm"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600">
              1. Task Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Internship Track
                </label>
                <select
                  value={internshipId}
                  onChange={(e) => {
                    setInternshipId(e.target.value);
                    setModuleId("");
                  }}
                  className="w-full h-10 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
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
                  Module Assignment
                </label>
                <select
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="">(No specific module)</option>
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Description & Instructions <span className="text-red-500">*</span>
              </label>
              <Textarea
                rows={5}
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
                <span>2. Acceptance Requirements</span>
              </h2>
              <span className="text-xs text-slate-400 font-semibold">
                {requirements.length} item(s)
              </span>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add checklist item..."
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

          {/* Resources & Uploads Manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              <span>3. PPT / PDF Resources & Links</span>
            </h2>

            {/* Attached Resources List */}
            {resources.length > 0 && (
              <div className="space-y-2 mb-4">
                {resources.map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {res.type === "PPT" ? (
                        <Presentation className="w-4 h-4 text-amber-600" />
                      ) : res.type === "PDF" ? (
                        <FileText className="w-4 h-4 text-red-600" />
                      ) : (
                        <Link2 className="w-4 h-4 text-blue-600" />
                      )}
                      <div>
                        <p className="font-bold text-slate-800">{res.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs sm:max-w-md">
                          {res.file_path}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="text-[9px] font-bold bg-slate-200 text-slate-700 py-0">
                        {res.type}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(res.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Resource Form */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs font-bold text-slate-700">
                Attach New Material / PPT Slide Deck
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  placeholder="Resource Title (e.g. Week 1 Slide Deck)"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="sm:col-span-2 bg-white text-xs rounded-xl"
                />
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value as any)}
                  className="h-9 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl"
                >
                  <option value="PPT">PPT Presentation</option>
                  <option value="PDF">PDF Guide</option>
                  <option value="LINK">Documentation Link</option>
                </select>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="URL or Storage Path (e.g. https://... or uploaded path)"
                  value={resFilePath}
                  onChange={(e) => setResFilePath(e.target.value)}
                  className="bg-white text-xs rounded-xl"
                />

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{uploadingFile ? "Uploading..." : "Upload PPT/PDF File"}</span>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Saves directly to private task-resources bucket
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddResource}
                disabled={addingResource}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {addingResource ? "Saving..." : "Attach Resource"}
              </Button>
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
            </div>

            <div className="pt-2 border-t border-slate-100">
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
                    Visible to enrolled students
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
                    Hidden from student roadmap
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
