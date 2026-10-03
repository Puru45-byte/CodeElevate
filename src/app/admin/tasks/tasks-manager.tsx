"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Search,
  Eye,
  FileText,
  Clock,
  Sparkles,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Internship, InternshipModule, Task } from "@/types/database";

interface TaskItem extends Task {
  module?: InternshipModule;
  internship?: Internship;
  resources?: any[];
}

interface TasksManagerProps {
  internships: Internship[];
  modules: InternshipModule[];
  initialSelectedInternshipId?: string;
  initialSelectedModuleId?: string;
  initialTasks: TaskItem[];
}

export function TasksManager({
  internships,
  modules,
  initialSelectedInternshipId,
  initialSelectedModuleId,
  initialTasks,
}: TasksManagerProps) {
  const router = useRouter();
  const [selectedInternshipId, setSelectedInternshipId] = useState(
    initialSelectedInternshipId || (internships[0]?.id ?? "")
  );
  const [selectedModuleId, setSelectedModuleId] = useState(
    initialSelectedModuleId || "ALL"
  );
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [loading, setLoading] = useState(false);

  const filteredModules = modules.filter(
    (m) => m.internship_id === selectedInternshipId
  );

  const handleInternshipChange = async (internshipId: string) => {
    setSelectedInternshipId(internshipId);
    setSelectedModuleId("ALL");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tasks?internshipId=${internshipId}`);
      const data = await res.json();
      if (res.ok && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleModuleChange = async (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setLoading(true);
    try {
      const url =
        moduleId === "ALL"
          ? `/api/admin/tasks?internshipId=${selectedInternshipId}`
          : `/api/admin/tasks?internshipId=${selectedInternshipId}&moduleId=${moduleId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      toast.error("Failed to filter tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (task: TaskItem) => {
    const newStatus = task.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus as any } : t))
      );
      toast.success(`Task status: ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Delete milestone task "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted.");
    } catch (err: any) {
      toast.error(err.message || "Deletion failed");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const newTasks = [...tasks];
    const temp = newTasks[index];
    newTasks[index] = newTasks[targetIndex];
    newTasks[targetIndex] = temp;

    const reorderedItems = newTasks.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));

    setTasks(reorderedItems);

    try {
      await fetch(`/api/admin/tasks/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reorderedItems.map((t) => ({ id: t.id, position: t.position })),
        }),
      });
      toast.success("Task order updated");
    } catch (err) {
      toast.error("Failed to save reorder");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Milestone Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure practical programming milestones, GitHub deliverables,
            and learning resources.
          </p>
        </div>

        <Link
          href={`/admin/tasks/new?internshipId=${selectedInternshipId}${
            selectedModuleId !== "ALL" ? `&moduleId=${selectedModuleId}` : ""
          }`}
        >
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 rounded-xl shadow-sm">
            <Plus className="w-4 h-4" />
            Create Milestone Task
          </Button>
        </Link>
      </div>

      {/* Filter / Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Track selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase">
              Internship Track
            </label>
            <select
              value={selectedInternshipId}
              onChange={(e) => handleInternshipChange(e.target.value)}
              className="w-full h-10 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {internships.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </select>
          </div>

          {/* Module selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase">
              Module Filter
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => handleModuleChange(e.target.value)}
              className="w-full h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Modules</option>
              {filteredModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase">
              Search Tasks
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Loading tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No milestone tasks found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Add practical coding deliverables for this track or module.
          </p>
          <Link
            href={`/admin/tasks/new?internshipId=${selectedInternshipId}${
              selectedModuleId !== "ALL" ? `&moduleId=${selectedModuleId}` : ""
            }`}
          >
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create First Task
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {index + 1}
                  </span>

                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5 mt-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === filteredTasks.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {task.title}
                    </h3>

                    <button
                      onClick={() => handleTogglePublish(task)}
                      title="Toggle publish status"
                    >
                      <Badge
                        className={`text-[10px] font-bold py-0.5 px-2 cursor-pointer ${
                          task.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        {task.status}
                      </Badge>
                    </button>

                    {task.is_required && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold text-blue-600 bg-blue-50/60 border-blue-200"
                      >
                        Required for Certificate
                      </Badge>
                    )}

                    {task.module && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {task.module.title.split(" - ")[0]}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-500 pt-1">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Due {task.deadline_days_after_start} days after start</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{task.requirements?.length || 0} Requirements</span>
                    </div>

                    {task.resources && task.resources.length > 0 && (
                      <div className="flex items-center gap-1 text-indigo-600 font-bold">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{task.resources.length} Attachments/PPT</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Link href={`/admin/tasks/${task.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit & Uploads
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteTask(task.id, task.title)}
                  className="rounded-xl border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
