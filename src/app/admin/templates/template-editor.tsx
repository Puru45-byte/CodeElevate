"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit2, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TemplateConfig {
  signatory_name?: string;
  signatory_title?: string;
  organization?: string;
  tagline?: string;
  signature_text?: string;
}

interface TemplateEditorProps {
  templateId: string;
  initialConfig: TemplateConfig;
}

export function TemplateEditor({
  templateId,
  initialConfig,
}: TemplateEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [signatoryName, setSignatoryName] = useState(
    initialConfig?.signatory_name || "Sanika Deore"
  );
  const [signatoryTitle, setSignatoryTitle] = useState(
    initialConfig?.signatory_title ||
      "Head of Academic Programs & Engineering"
  );
  const [organization, setOrganization] = useState(
    initialConfig?.organization || "CodeElevate EdTech Platform"
  );
  const [tagline, setTagline] = useState(
    initialConfig?.tagline ||
      "Practical Internship & Career Acceleration Platform"
  );
  const [signatureText, setSignatureText] = useState(
    initialConfig?.signature_text || "Sdeore"
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatory_name: signatoryName,
          signatory_title: signatoryTitle,
          organization,
          tagline,
          signature_text: signatureText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save template");

      toast.success("Certificate template updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update template");
    } finally {
      setLoading(false);
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">Signatory Name:</span>
            <span className="font-bold text-slate-800">{signatoryName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">Signatory Title:</span>
            <span className="text-slate-700">{signatoryTitle}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">Organization:</span>
            <span className="text-slate-700">{organization}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">Tagline:</span>
            <span className="text-slate-700">{tagline}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">Signature Text:</span>
            <span className="font-serif italic text-blue-900 text-sm font-semibold">
              {signatureText}
            </span>
          </div>
        </div>

        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          size="sm"
          className="w-full gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Template Configuration
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="bg-slate-50 p-4 rounded-xl border border-blue-200 space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <h4 className="text-xs font-bold text-slate-900">
          Edit Certificate Defaults
        </h4>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <label className="block text-slate-500 font-medium mb-1">
            Signatory Name
          </label>
          <input
            type="text"
            value={signatoryName}
            onChange={(e) => setSignatoryName(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-500 font-medium mb-1">
            Signatory Title
          </label>
          <input
            type="text"
            value={signatoryTitle}
            onChange={(e) => setSignatoryTitle(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-500 font-medium mb-1">
            Organization Name
          </label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-500 font-medium mb-1">
            Header Tagline
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-500 font-medium mb-1">
            Signature Script Text
          </label>
          <input
            type="text"
            value={signatureText}
            onChange={(e) => setSignatureText(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          onClick={() => setIsEditing(false)}
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Save Config
        </Button>
      </div>
    </form>
  );
}
