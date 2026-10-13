"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, BookOpen } from "lucide-react";

export interface SwitcherEnrollmentItem {
  id: string;
  status: string;
  internship?: {
    title: string;
    slug?: string;
  } | null;
}

interface EnrollmentSwitcherProps {
  enrollments: SwitcherEnrollmentItem[];
  currentEnrollmentId: string;
}

export function EnrollmentSwitcher({
  enrollments,
  currentEnrollmentId,
}: EnrollmentSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (!enrollments || enrollments.length <= 1) {
    return null;
  }

  const current =
    enrollments.find((e) => e.id === currentEnrollmentId) || enrollments[0];

  const handleSelect = (id: string) => {
    if (id === currentEnrollmentId) return;
    router.push(`${pathname}?enrollment=${id}`);
  };

  const getStatusBadge = (status: string) => {
    if (status === "ACTIVE") {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold py-0.5 px-2">
          Active
        </Badge>
      );
    }
    if (status === "COMPLETED") {
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold py-0.5 px-2">
          Completed
        </Badge>
      );
    }
    if (status === "EXPIRED") {
      return (
        <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-bold py-0.5 px-2">
          Expired
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] text-slate-500 py-0.5 px-2">
        {status}
      </Badge>
    );
  };

  return (
    <div className="inline-flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 rounded-xl bg-white border-slate-200 hover:bg-slate-50 text-xs font-bold gap-2 shadow-sm text-slate-800"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="truncate max-w-[160px] sm:max-w-[220px]">
              {current?.internship?.title || "Track"}
            </span>
            {getStatusBadge(current?.status)}
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-0.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-72 p-1.5 rounded-2xl bg-white border-slate-200 shadow-xl space-y-1"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Switch Internship Track
          </div>
          {enrollments.map((item) => {
            const isSelected = item.id === current?.id;
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-blue-50/80 text-blue-900 font-bold"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-500"
                        : item.status === "COMPLETED"
                        ? "bg-blue-500"
                        : "bg-slate-300"
                    }`}
                  />
                  <span className="text-xs truncate">
                    {item.internship?.title || "Internship Track"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(item.status)}
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
