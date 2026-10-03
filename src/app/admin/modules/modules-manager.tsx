"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  BookOpen,
  Save,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Internship, InternshipModule, Task } from "@/types/database";

interface ModuleWithTasks extends InternshipModule {
  tasks?: Task[];
}

interface ModulesManagerProps {
  internships: Internship[];
  initialSelectedInternshipId?: string;
  initialModules: ModuleWithTasks[];
}

export function ModulesManager({
  internships,
  initialSelectedInternshipId,
  initialModules,
}: ModulesManagerProps) {
  const router = useRouter();
  const [selectedInternshipId, setSelectedInternshipId] = useState(
    initialSelectedInternshipId || (internships[0]?.id ?? "")
  );
  const [modules, setModules] = useState<ModuleWithTasks[]>(initialModules);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleWithTasks | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const currentInternship = internships.find(
    (i) => i.id === selectedInternshipId
  );

  const handleInternshipChange = async (internshipId: string) => {
    setSelectedInternshipId(internshipId);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/modules?internshipId=${internshipId}`);
      const data = await res.json();
      if (res.ok && data.modules) {
        setModules(data.modules);
      }
    } catch (err) {
      toast.error("Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingModule(null);
    setTitle(`Week ${modules.length + 1} - `);
    setDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mod: ModuleWithTasks) => {
    setEditingModule(mod);
    setTitle(mod.title);
    setDescription(mod.description || "");
    setIsModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Module title is required");
      return;
    }

    try {
      if (editingModule) {
        // Update
        const res = await fetch(`/api/admin/modules/${editingModule.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: description || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update");

        setModules((prev) =>
          prev.map((m) =>
            m.id === editingModule.id ? { ...m, title, description } : m
          )
        );
        toast.success("Module updated");
      } else {
        // Create
        const res = await fetch(`/api/admin/modules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            internship_id: selectedInternshipId,
            title,
            description: description || null,
            position: modules.length + 1,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create");

        setModules((prev) => [...prev, data.module]);
        toast.success("Module created");
      }

      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save module");
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${moduleTitle}"? Tasks assigned to this module will be unassigned.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      toast.success("Module deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete module");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const newModules = [...modules];
    const temp = newModules[index];
    newModules[index] = newModules[targetIndex];
    newModules[targetIndex] = temp;

    // Update positions
    const reorderedItems = newModules.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));

    setModules(reorderedItems);

    try {
      await fetch(`/api/admin/modules/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reorderedItems.map((m) => ({ id: m.id, position: m.position })),
        }),
      });
      toast.success("Order updated");
    } catch (err) {
      toast.error("Failed to save reorder");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Curriculum Modules
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize weekly engineering tracks and modular learning milestones
            per internship.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          disabled={!selectedInternshipId}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Module
        </Button>
      </div>

      {/* Internship Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase shrink-0">
            Selected Track:
          </span>
          <select
            value={selectedInternshipId}
            onChange={(e) => handleInternshipChange(e.target.value)}
            className="w-full sm:w-80 h-10 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            {internships.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title} ({i.category})
              </option>
            ))}
          </select>
        </div>

        {currentInternship && (
          <div className="flex items-center gap-2">
            <Link href={`/admin/tasks?internshipId=${currentInternship.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                View Tasks for Track
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Modules List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Loading track modules...
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No modules created yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Create weekly modular tracks for this internship or apply the
            default template under Internship details.
          </p>
          <Button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add First Module
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, index) => (
            <div
              key={mod.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center border border-blue-100 shrink-0">
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
                      disabled={index === modules.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {mod.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold text-slate-500 bg-slate-50 border-slate-200"
                    >
                      Position {mod.position}
                    </Badge>
                  </div>
                  {mod.description && (
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      {mod.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Link
                  href={`/admin/tasks?internshipId=${selectedInternshipId}&moduleId=${mod.id}`}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Tasks ({mod.tasks?.length || 0})
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(mod)}
                  className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteModule(mod.id, mod.title)}
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

      {/* Create / Edit Module Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingModule ? "Edit Module" : "Add Module"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Module Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Week 1 - Foundations & Setup"
                  required
                  className="bg-slate-50 border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Module Description & Learning Outcomes
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="What concepts and deliverables are focused during this module..."
                  className="bg-slate-50 border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs font-bold border-slate-200 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingModule ? "Update Module" : "Create Module"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
