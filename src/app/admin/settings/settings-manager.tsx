"use client";

import React, { useState } from "react";
import {
  Shield,
  Save,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle,
  KeyRound,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function SettingsManager() {
  const [orgName, setOrgName] = useState("CodeElevate EdTech Platform");
  const [tagline, setTagline] = useState("Learn. Build. Get Certified.");
  const [supportEmail, setSupportEmail] = useState("codeelevate.team@outlook.com");
  const [supportPhone, setSupportPhone] = useState("+91 7972399690");
  const [address, setAddress] = useState(
    "Bangalore Technology Corridor, Karnataka, India"
  );
  const [websiteUrl, setWebsiteUrl] = useState("https://codeelevate.tech");
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Organization settings updated successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Platform Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure organization branding, support channels, and platform
            administration.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 rounded-xl shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Org info */}
        <div className="md:col-span-2 space-y-6">
          <form
            onSubmit={handleSave}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
          >
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>Organization & Brand Details</span>
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Organization Legal Name
              </label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Brand Tagline
              </label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Support Email</span>
                </label>
                <Input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Support Phone / WhatsApp</span>
                </label>
                <Input
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Headquarters Address</span>
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Public Web Domain</span>
              </label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
            </div>
          </form>
        </div>

        {/* Right 1 Col: Admin SQL Seeding Helper */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Terminal className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-white">
                Admin Role SQL Snippet
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To promote any user email to administrator, execute this query in
              the Supabase SQL Editor:
            </p>

            <div className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-800">
              <code>
                UPDATE public.profiles
                <br />
                SET role = &apos;admin&apos;
                <br />
                WHERE email = &apos;your-email@example.com&apos;;
              </code>
            </div>

            <p className="text-[10px] text-slate-400">
              All admin pages enforce server-side validation against this role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
