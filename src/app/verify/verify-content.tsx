"use client";

import React, { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Award,
  Calendar,
  Clock,
  Building,
  FileText,
  Hash,
} from "lucide-react";
import { PublicCertificateVerification } from "@/types/database";

export function VerifyCertificateContent() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PublicCertificateVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Certificate not found");
        return;
      }
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 md:py-16">
      <div className="container max-w-3xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Verify Certificate
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Enter your certificate number to verify its authenticity and view details
            from CodeElevate.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleVerify}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
        >
          <label
            htmlFor="cert-input"
            className="text-xs font-bold text-slate-700 block"
          >
            Certificate Number
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="cert-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter certificate number (e.g., CE-COMP-0001/2026)"
                className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="gap-2 font-bold px-6 h-11"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Verify
            </Button>
          </div>

          {/* Example format */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
            <span className="font-semibold uppercase tracking-wider">
              Example Format:
            </span>
            <span className="font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">
              CE-COMP-0001/2026
            </span>
            <span className="font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">
              CE-CONF-0001/2026
            </span>
          </div>
        </form>

        {/* Results */}
        {hasSearched && !isLoading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <XCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-red-900">
              Certificate Not Found
            </h3>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="rounded-2xl border border-emerald-200 bg-white overflow-hidden shadow-sm">
            {/* Status header */}
            <div className="bg-emerald-50 border-b border-emerald-200 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900">
                    Certificate Verified
                  </p>
                  <p className="text-[11px] text-emerald-600">
                    This certificate is authentic and valid
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 font-bold border-emerald-200">
                {result.status === "ISSUED" || result.status === "VALID"
                  ? "✓ Verified"
                  : result.status}
              </Badge>
            </div>

            {/* Intern Information */}
            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Intern Information
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  label="Intern Name"
                  value={result.student_name}
                  icon={<User className="h-3.5 w-3.5" />}
                />
                <InfoRow
                  label="Student ID"
                  value={result.student_code || result.student_id}
                  icon={<Hash className="h-3.5 w-3.5" />}
                />
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" />
                  Certificate Details
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  label="Certificate Number"
                  value={result.certificate_number}
                  icon={<FileText className="h-3.5 w-3.5" />}
                  mono
                />
                <InfoRow
                  label="Certificate Type"
                  value={result.certificate_type}
                  icon={<Award className="h-3.5 w-3.5" />}
                />
                <InfoRow
                  label="Domain"
                  value={result.internship_title || result.course_title || "—"}
                  icon={<FileText className="h-3.5 w-3.5" />}
                />
                <InfoRow
                  label="Issue Date"
                  value={
                    result.issue_date
                      ? new Date(result.issue_date).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          }
                        )
                      : "—"
                  }
                  icon={<Calendar className="h-3.5 w-3.5" />}
                />
                <InfoRow
                  label="Duration"
                  value={result.duration}
                  icon={<Clock className="h-3.5 w-3.5" />}
                />
                <InfoRow
                  label="Status"
                  value={
                    result.status === "ISSUED" || result.status === "VALID"
                      ? "✓ Issued"
                      : result.status
                  }
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                />
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  Issuing Authority
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  label="Organization"
                  value={result.organization}
                  icon={<Building className="h-3.5 w-3.5" />}
                />
                <InfoRow
                  label="Authorized By"
                  value="CodeElevate"
                  icon={<ShieldCheck className="h-3.5 w-3.5" />}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
        {icon && <span className="text-slate-300">{icon}</span>}
        {label}
      </p>
      <p
        className={`text-sm font-bold text-slate-900 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
