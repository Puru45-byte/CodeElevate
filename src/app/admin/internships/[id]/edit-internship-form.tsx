"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Save,
  Tag,
  Trash2,
  ExternalLink,
  Layers,
  CheckSquare,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Internship, InternshipModule, Task } from "@/types/database";

interface EditInternshipFormProps {
  internship: Internship & {
    modules?: InternshipModule[];
    tasks?: Task[];
  };
}

export function EditInternshipForm({ internship }: EditInternshipFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  const [title, setTitle] = useState(internship.title || "");
  const [slug, setSlug] = useState(internship.slug || "");
  const [category, setCategory] = useState(internship.category || "Development");
  const [shortDescription, setShortDescription] = useState(
    internship.short_description || ""
  );
  const [description, setDescription] = useState(internship.description || "");
  const [iconUrl, setIconUrl] = useState(internship.icon_url || "/icons/python.png");
  const [customIcon, setCustomIcon] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    internship.thumbnail_url || "/images/hero.png"
  );
  const [durationMonths, setDurationMonths] = useState(
    internship.duration_months || 1
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    internship.status as any || "PUBLISHED"
  );

  const [technologies, setTechnologies] = useState<string[]>(
    internship.technologies || []
  );
  const [techInput, setTechInput] = useState("");

  const stockIcons = [
    { name: "Python", url: "/icons/python.png" },
    { name: "React", url: "/icons/react.png" },
    { name: "Java", url: "/icons/java.png" },
    { name: "AI / Brain", url: "/icons/ai-brain.png" },
    { name: "Cloud", url: "/icons/blue-cloud.png" },
    { name: "Security / Shield", url: "/icons/blue-shield.png" },
    { name: "Book / Learning", url: "/icons/open-book.png" },
  ];

  const handleAddTech = () => {
    if (!techInput.trim()) return;
    if (!technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
    }
    setTechInput("");
  };

  const handleRemoveTech = (tagToRemove: string) => {
    setTechnologies(technologies.filter((t) => t !== tagToRemove));
  };

  const handleApplyTemplate = async () => {
    if (
      !confirm(
        "Apply default 4-week course structure? This will regenerate standard weekly modules and practical milestones for this track."
      )
    ) {
      return;
    }

    setApplyingTemplate(true);
    try {
      const res = await fetch(
        `/api/admin/internships/${internship.id}/apply-template`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply template");

      toast.success(data.message || "Template applied successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Template application failed");
    } finally {
      setApplyingTemplate(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/internships/${internship.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          category,
          short_description: shortDescription || null,
          description,
          icon_url: customIcon || iconUrl,
          thumbnail_url: thumbnailUrl || null,
          technologies,
          duration_months: Number(durationMonths) || 1,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update internship");

      toast.success("Internship updated successfully!");
      router.push("/admin/internships");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${internship.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/internships/${internship.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      toast.success("Internship deleted.");
      router.push("/admin/internships");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Deletion failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin/internships">
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                Edit: {internship.title}
              </h1>
              <Link
                href={`/internships/${internship.slug}`}
                target="_blank"
                className="text-slate-400 hover:text-blue-600"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-xs text-slate-500">
              Manage curriculum structure, modules, and task milestones
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
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 rounded-xl shadow-sm"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Modules</p>
              <p className="text-base font-extrabold text-slate-900">
                {internship.modules?.length || 0} Modules
              </p>
            </div>
          </div>
          <Link href={`/admin/modules?internshipId=${internship.id}`}>
            <Button size="sm" variant="outline" className="rounded-lg text-xs font-bold">
              Manage
            </Button>
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Tasks</p>
              <p className="text-base font-extrabold text-slate-900">
                {internship.tasks?.length || 0} Tasks
              </p>
            </div>
          </div>
          <Link href={`/admin/tasks?internshipId=${internship.id}`}>
            <Button size="sm" variant="outline" className="rounded-lg text-xs font-bold">
              Manage
            </Button>
          </Link>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-900">Course Template</p>
            <p className="text-xs text-blue-700">4-Week standard layout</p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleApplyTemplate}
            disabled={applyingTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold gap-1 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {applyingTemplate ? "Applying..." : "Apply Template"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600">
              1. Track Information
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Title <span className="text-red-500">*</span>
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
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2 text-xs text-slate-500 font-mono rounded-l-xl">
                  /internships/
                </span>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200 rounded-r-xl rounded-l-none font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Domain Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Development">Development</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Data">Data</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Design">Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Duration (Months)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="bg-slate-50 border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Short Summary
              </label>
              <Input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Detailed Curriculum Overview <span className="text-red-500">*</span>
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

          {/* Technologies Tag Input */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>2. Technologies & Stack</span>
            </h2>

            <div className="flex gap-2">
              <Input
                placeholder="Add technology tag..."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
                className="bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
              <Button
                type="button"
                onClick={handleAddTech}
                variant="outline"
                className="rounded-xl border-slate-200 gap-1 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {technologies.map((t) => (
                <Badge
                  key={t}
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs py-1 px-2.5 rounded-lg border-slate-200 flex items-center gap-1.5"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(t)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col */}
        <div className="space-y-6">
          {/* Icon selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600">
              Icon Asset
            </h2>

            <div className="grid grid-cols-4 gap-2">
              {stockIcons.map((ic) => {
                const isSelected = iconUrl === ic.url && !customIcon;
                return (
                  <button
                    key={ic.url}
                    type="button"
                    onClick={() => {
                      setIconUrl(ic.url);
                      setCustomIcon("");
                    }}
                    className={`relative p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="relative w-8 h-8">
                      <Image
                        src={ic.url}
                        alt={ic.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 truncate w-full text-center">
                      {ic.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-600">
                Custom Icon Path
              </label>
              <Input
                value={customIcon || (!stockIcons.some(i => i.url === iconUrl) ? iconUrl : "")}
                onChange={(e) => setCustomIcon(e.target.value)}
                placeholder="/icons/custom.png"
                className="bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600">
              Publication Status
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
                  <p className="text-[10px] text-slate-500">Visible to students</p>
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
                  <p className="text-[10px] text-slate-500">Unpublished track</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="ARCHIVED"
                  checked={status === "ARCHIVED"}
                  onChange={() => setStatus("ARCHIVED")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Archived</p>
                  <p className="text-[10px] text-slate-500">Disabled & hidden</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
