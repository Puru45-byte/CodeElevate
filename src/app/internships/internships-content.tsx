"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Internship } from "@/types/database";
import { CourseCard } from "@/components/shared/CourseCard";
import { createClient } from "@/lib/supabase/client";
import { getPublishedInternships } from "@/lib/queries/internships";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";

const CATEGORIES = [
  "All",
  "Development",
  "AI/ML",
  "Cloud",
  "Data",
  "Cyber Security",
  "Design",
  "Other",
];

export function InternshipsContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ category?: string; q?: string }>;
}) {
  const searchParams = use(searchParamsPromise);
  const router = useRouter();
  const pathname = usePathname();

  const initialCategory = searchParams.category || "All";
  const initialQuery = searchParams.q || "";

  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getPublishedInternships(supabase);
        setInternships(data || []);
      } catch (err) {
        console.error("Failed to load internships:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL query params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "All") {
      params.set("category", selectedCategory);
    }
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery]);

  // Filter internships client-side
  const filteredInternships = internships.filter((internship) => {
    const currentCategory =
      internship.category || internship.domain || "";
    const matchesCategory =
      selectedCategory === "All" ||
      currentCategory === selectedCategory ||
      currentCategory.toLowerCase().includes(selectedCategory.toLowerCase());
    const query = searchQuery.toLowerCase();
    const techList = internship.technologies || internship.skills || [];
    const matchesSearch =
      !query ||
      internship.title.toLowerCase().includes(query) ||
      currentCategory.toLowerCase().includes(query) ||
      (internship.description || "").toLowerCase().includes(query) ||
      techList.some((s: string) => s.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search internships (e.g. Python, Java, AI...)"
            className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 border ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Internships Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredInternships.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            No tracks found
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search filters or selected domain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInternships.map((internship) => (
            <CourseCard
              key={internship.id}
              course={internship}
              onApplyClick={(c) => router.push(`/apply/${c.slug}`)}
            />
          ))}
        </div>
      )}
    </>
  );
}
