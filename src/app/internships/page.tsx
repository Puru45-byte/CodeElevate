import React, { Suspense } from "react";
import { Metadata } from "next";
import { InternshipsContent } from "./internships-content";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Explore Internships | CodeElevate",
  description:
    "Browse 12+ internship domains including Web Development, AI/ML, Cloud Computing, and more. Apply now for a 1-month practical learning experience.",
};

function InternshipsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-80 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  return (
    <div className="min-h-screen bg-slate-50/50 py-10 md:py-14">
      <div className="container space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Practical Tracks
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Explore 1-Month Internships
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Choose an internship domain, follow structured milestones, push
            solutions to GitHub, and receive a verified credential upon review.
          </p>
        </div>

        <Suspense fallback={<InternshipsGridSkeleton />}>
          <InternshipsContent searchParamsPromise={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
