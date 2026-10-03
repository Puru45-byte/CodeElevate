import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Internship } from "@/types/database";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Clock, Globe, ArrowRight, BookOpen } from "lucide-react";

interface CourseCardProps {
  course: Internship;
  onApplyClick?: (course: Internship) => void;
  isApplied?: boolean;
}

export function CourseCard({ course, onApplyClick, isApplied }: CourseCardProps) {
  const iconSrc = course.icon_url || course.icon || "/icons/open-book.png";
  const categoryName = course.category || course.domain || "Development";
  const techList = course.technologies || course.skills || [];

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-card-hover rounded-2xl">
      <div>
        <CardHeader className="p-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50/80 p-2.5 shadow-sm ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
              <Image
                src={iconSrc}
                alt={course.title}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            {/* Payment Visibility Rule: Free badge only */}
            <StatusBadge status="FREE" />
          </div>

          <div className="mt-4">
            <Badge variant="secondary" className="mb-2 bg-slate-100/90 text-slate-700 font-medium">
              {categoryName}
            </Badge>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {course.title}
            </h3>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 pb-4">
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {course.short_description || course.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{course.duration_months || 1} Month</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Remote</span>
            </div>
          </div>

          {techList.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {techList.slice(0, 3).map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-block rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-100"
                >
                  {skill}
                </span>
              ))}
              {techList.length > 3 && (
                <span className="inline-block rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-400">
                  +{techList.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="p-6 pt-2 flex items-center gap-2 border-t border-slate-50">
        <Link href={`/internships/${course.slug}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-slate-700 font-semibold hover:text-blue-600 hover:border-blue-200">
            <BookOpen className="w-3.5 h-3.5" />
            Curriculum
          </Button>
        </Link>
        {onApplyClick ? (
          <Button
            size="sm"
            onClick={() => onApplyClick(course)}
            disabled={isApplied}
            className="flex-1 gap-1 font-semibold"
          >
            {isApplied ? "Applied" : "Apply Now"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Link href={`/internships/${course.slug}`} className="flex-1">
            <Button size="sm" className="w-full gap-1 font-semibold">
              Explore
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
