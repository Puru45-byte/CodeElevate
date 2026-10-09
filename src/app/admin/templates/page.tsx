import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sparkles, LayoutTemplate } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TemplateEditor } from "./template-editor";

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

            <TemplateEditor templateId={t.id} initialConfig={t.config} />

            <p className="text-[11px] text-slate-500 italic">
              Edits to signatory details and header tagline update future and
              regenerated certificate PDFs immediately.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
