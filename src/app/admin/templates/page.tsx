import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { Award, Sparkles, CheckCircle, LayoutTemplate } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

export default async function AdminTemplatesPage() {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: templates } = await supabaseAdmin
    .from("certificate_templates")
    .select("*");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Certificate Templates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visual layouts, fonts, signatures, and styling configurations for
            issued credentials.
          </p>
        </div>

        <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-bold px-3 py-1 text-xs gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Level 8 Template Designer
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates?.map((t: any) => (
          <div
            key={t.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Created {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {t.is_default && (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                  Default Active Template
                </Badge>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Signatory:</span>
                <span className="font-bold text-slate-800">
                  {t.config?.signatory_name || "Pushkar Kumar"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Title:</span>
                <span className="text-slate-700">
                  {t.config?.signatory_title ||
                    "Head of Academic Programs & Engineering"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Organization:</span>
                <span className="text-slate-700">
                  {t.config?.organization || "CodeElevate EdTech Platform"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Interactive template editor, custom logo upload & signature builder
              will be expanded in Level 8.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
