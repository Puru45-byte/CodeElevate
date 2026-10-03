"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User as UserIcon, Eye, ArrowRight, GraduationCap, MapPin, Mail, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface StudentsTableProps {
  students: (Profile & {
    enrollments_count?: number;
    applications_count?: number;
  })[];
}

export function StudentsTable({ students }: StudentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = students.filter((s) => {
    const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    const email = (s.email || "").toLowerCase();
    const id = (s.student_id || "").toLowerCase();
    const college = (s.college || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      !query ||
      name.includes(query) ||
      email.includes(query) ||
      id.includes(query) ||
      college.includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search students by name, ID, email, or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl text-xs sm:text-sm"
          />
        </div>
        <span className="text-xs font-bold text-slate-400 hidden sm:inline">
          {filtered.length} Students Registered
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No students found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Student ID</th>
                  <th className="py-4 px-6">Contact Details</th>
                  <th className="py-4 px-6">College & Degree</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((student) => {
                  const fullName =
                    `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
                    student.full_name ||
                    "Student";

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            {student.photo_url ? (
                              <Image
                                src={student.photo_url}
                                alt={fullName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <UserIcon className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{fullName}</p>
                            <p className="text-[11px] text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-blue-600">
                        {student.student_id || "CE2026"}
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        <p>{student.phone ? `+91 ${student.phone}` : "—"}</p>
                        <p className="text-[10px] text-slate-400">{student.city || ""} {student.state ? `, ${student.state}` : ""}</p>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        <p className="font-semibold text-slate-800 line-clamp-1">{student.college || "—"}</p>
                        <p className="text-[10px] text-slate-400">{student.degree || ""} {student.department ? `• ${student.department}` : ""}</p>
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        {formatDate(student.created_at)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link href={`/admin/students/${student.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 px-3 rounded-lg text-xs font-bold text-blue-600 gap-1">
                            <span>Inspect</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
