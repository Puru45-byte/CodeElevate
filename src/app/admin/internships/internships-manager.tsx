"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Filter,
  Layers,
  CheckSquare,
  BookOpen,
  Sparkles,
  ExternalLink,
  Edit,
  Archive,
  Eye,
  CheckCircle,
  AlertCircle,
  Copy,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface InternshipWithCounts {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description?: string | null;
  category: string;
  icon_url?: string | null;
  thumbnail_url?: string | null;
  technologies: string[];
  duration_months: number;
  is_free: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  created_at: string;
  modules?: { id: string }[];
  tasks?: { id: string; is_required: boolean }[];
}

interface InternshipsManagerProps {
  initialInternships: InternshipWithCounts[];
}

export function InternshipsManager({
  initialInternships,
}: InternshipsManagerProps) {
  const router = useRouter();
  const [internships, setInternships] = useState(initialInternships);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [applyingTemplateId, setApplyingTemplateId] = useState<string | null>(
    null
  );

  const categories = [
    "ALL",
    "Development",
    "AI/ML",
    "Cloud",
    "Data",
    "Cyber Security",
    "Design",
    "Other",
  ];

  const filteredInternships = internships.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.technologies.some((t) =>
        t.toLowerCase().includes(search.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "ALL" || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleApplyTemplate = async (internshipId: string, title: string) => {
    if (
      !confirm(
        `Apply default 4-week module and task structure to "${title}"? This will configure standard milestones for this track.`
      )
    ) {
      return;
    }

    setApplyingTemplateId(internshipId);
    try {
      const res = await fetch(
        `/api/admin/internships/${internshipId}/apply-template`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply template");

      toast.success(data.message || "Template applied successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setApplyingTemplateId(null);
    }
  };

  const handleToggleStatus = async (
    internshipId: string,
    currentStatus: string
  ) => {
    const newStatus =
      currentStatus === "PUBLISHED"
        ? "DRAFT"
        : currentStatus === "DRAFT"
        ? "PUBLISHED"
        : "PUBLISHED";

    try {
      const res = await fetch(`/api/admin/internships/${internshipId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setInternships((prev) =>
        prev.map((item) =>
          item.id === internshipId ? { ...item, status: newStatus as any } : item
        )
      );
      toast.success(`Internship status changed to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Status update failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Internship Programs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your domain curricula, weekly modules, practical milestones,
            and enrollment catalogs.
          </p>
        </div>
        <Link href="/admin/internships/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-sm rounded-xl">
            <Plus className="w-4 h-4" />
            Create Internship
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by title, slug, technology..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50/70 border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold mr-1 shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Internships Grid */}
      {filteredInternships.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No internships found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters, or create a new
            internship program track.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInternships.map((internship) => {
            const moduleCount = internship.modules?.length || 0;
            const taskCount = internship.tasks?.length || 0;

            return (
              <div
                key={internship.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5">
                  {/* Top Bar with Icon & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                        {internship.icon_url ? (
                          <Image
                            src={internship.icon_url}
                            alt={internship.title}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        ) : (
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold text-blue-600 bg-blue-50/60 border-blue-200 py-0"
                        >
                          {internship.category}
                        </Badge>
                        <h3 className="font-extrabold text-slate-900 text-base leading-snug mt-1 group-hover:text-blue-600 transition-colors">
                          {internship.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleToggleStatus(internship.id, internship.status)
                      }
                      title="Click to toggle status"
                    >
                      <Badge
                        className={`text-[10px] font-bold py-0.5 px-2 cursor-pointer transition-colors ${
                          internship.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : internship.status === "DRAFT"
                            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {internship.status}
                      </Badge>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {internship.short_description || internship.description}
                  </p>

                  {/* Technologies tags */}
                  {internship.technologies &&
                    internship.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {internship.technologies.slice(0, 4).map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                        {internship.technologies.length > 4 && (
                          <span className="text-[10px] font-medium bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded-md">
                            +{internship.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                  {/* Metrics strip */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div className="border-r border-slate-200 pr-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Modules
                      </p>
                      <p className="text-sm font-extrabold text-slate-800">
                        {moduleCount} Weeks
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Tasks
                      </p>
                      <p className="text-sm font-extrabold text-slate-800">
                        {taskCount} Milestones
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() =>
                      handleApplyTemplate(internship.id, internship.title)
                    }
                    disabled={applyingTemplateId === internship.id}
                    className="text-[11px] font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white"
                    title="Apply standard 4-week module & task template"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {applyingTemplateId === internship.id
                        ? "Applying..."
                        : "Apply Template"}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/internships/${internship.slug}`}
                      target="_blank"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors"
                      title="Preview public page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <Link href={`/admin/internships/${internship.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-bold rounded-lg border-slate-200 text-slate-700 hover:bg-white gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
