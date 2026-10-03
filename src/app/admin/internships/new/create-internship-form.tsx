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
  Upload,
  Check,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function CreateInternshipForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Development");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("/icons/python.png");
  const [customIcon, setCustomIcon] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("/images/hero.png");
  const [durationMonths, setDurationMonths] = useState(1);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  // Technology tags state
  const [technologies, setTechnologies] = useState<string[]>([
    "Python 3.x",
    "FastAPI",
    "PostgreSQL",
    "Git",
  ]);
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

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !description.trim()) {
      toast.error("Please fill in all required fields (Title, Slug, Description)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/internships", {
        method: "POST",
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
          is_free: true,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create internship");

      toast.success("Internship created successfully!");

      // Auto-apply default course template
      try {
        await fetch(`/api/admin/internships/${data.internship.id}/apply-template`, {
          method: "POST",
        });
      } catch (tmplErr) {
        console.warn("Auto template error:", tmplErr);
      }

      router.push("/admin/internships");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save internship");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
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
            <h1 className="text-xl font-extrabold text-slate-900">
              Create New Internship
            </h1>
            <p className="text-xs text-slate-500">
              Define the curriculum track metadata and practical requirements
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 rounded-xl shadow-sm"
        >
          <Save className="w-4 h-4" />
          {loading ? "Creating..." : "Save Internship"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600">
              1. Basic Information
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Internship Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Next.js Full-Stack Developer"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
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
                  placeholder="nextjs-full-stack-developer"
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
                Short Summary (1-2 sentences)
              </label>
              <Input
                placeholder="Brief highlight shown in cards and headers..."
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
                placeholder="Comprehensive description of what the student will build, learn, and deliver..."
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
                placeholder="Add technology (e.g. Next.js, Docker, MongoDB)..."
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

        {/* Right 1 Col: Icon, Status, Settings */}
        <div className="space-y-6">
          {/* Icon Selector */}
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
                Or Custom Icon Path / URL
              </label>
              <Input
                placeholder="/icons/custom.png"
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Publishing & Default Template Notice */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600">
              Publishing State
            </h2>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={status === "PUBLISHED"}
                  onChange={() => setStatus("PUBLISHED")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Published (Active)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Visible to all students in public catalog
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={status === "DRAFT"}
                  onChange={() => setStatus("DRAFT")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Draft Only</p>
                  <p className="text-[10px] text-slate-500">
                    Hidden from public catalog
                  </p>
                </div>
              </label>
            </div>

            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Default Structure Auto-Applied</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Upon saving, standard 4 weekly modules and 8 practical milestone
                tasks will be generated automatically. You can customize them
                under Modules and Tasks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
