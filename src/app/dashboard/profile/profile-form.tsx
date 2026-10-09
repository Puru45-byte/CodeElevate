"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDIAN_STATES, DEGREES, PASSOUT_YEARS } from "@/lib/constants";
import {
  User,
  MapPin,
  GraduationCap,
  Upload,
  CheckCircle2,
  Loader2,
  Phone,
  FileText,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    profile.photo_url || null
  );
  const [resumePreview, setResumePreview] = useState<string | null>(
    profile.resume_url || null
  );
  const [resumeFileName, setResumeFileName] = useState<string | null>(
    profile.resume_file_name || null
  );
  const [isResumeUploading, setIsResumeUploading] = useState<boolean>(false);

  const [phone, setPhone] = useState(profile.phone || "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || "");
  const [address, setAddress] = useState(profile.address || "");
  const [city, setCity] = useState(profile.city || "");
  const [state, setState] = useState(profile.state || "Maharashtra");
  const [pincode, setPincode] = useState(profile.pincode || "");
  const [college, setCollege] = useState(profile.college || "");
  const [degree, setDegree] = useState(profile.degree || "B.Tech");
  const [department, setDepartment] = useState(profile.department || "");
  const [passoutYear, setPassoutYear] = useState(profile.passout_year || "2026");

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
    profile.full_name ||
    "Student";

  // Handle Photo upload
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2 MB.");
      return;
    }

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}/photo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        toast.error("Photo upload failed");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName);

      const newUrl = publicUrlData.publicUrl;
      setPhotoPreview(newUrl);

      // Save url to profile
      await supabase
        .from("profiles")
        .update({ photo_url: newUrl, updated_at: new Date().toISOString() })
        .eq("id", profile.id);

      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to upload photo");
    }
  };

  // Handle Resume PDF upload
  const handleResumeSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file for your resume.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Resume file size must be less than 2 MB.");
      return;
    }

    setIsResumeUploading(true);

    try {
      const supabase = createClient();
      const fileName = `${profile.id}/resume-${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file, { contentType: "application/pdf", upsert: true });

      if (uploadError) {
        toast.error("Resume upload failed. " + uploadError.message);
        setIsResumeUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);

      const newUrl = publicUrlData.publicUrl;
      const newFileName = file.name;

      setResumePreview(newUrl);
      setResumeFileName(newFileName);

      // Save to profile
      await supabase
        .from("profiles")
        .update({
          resume_url: newUrl,
          resume_file_name: newFileName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      toast.success("Default resume updated! Next internship applications will auto-fill it.");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload resume");
    } finally {
      setIsResumeUploading(false);
    }
  };

  const handleRemoveResume = async () => {
    try {
      const supabase = createClient();
      setResumePreview(null);
      setResumeFileName(null);
      await supabase
        .from("profiles")
        .update({
          resume_url: null,
          resume_file_name: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
      toast.success("Resume removed from profile.");
    } catch {
      toast.error("Failed to remove resume.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Phone number must be exactly 10 digits starting with 6, 7, 8, or 9.");
      return;
    }

    if (pincode && !/^\d{6}$/.test(pincode)) {
      toast.error("Pincode must be exactly 6 digits.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || null,
          address: address.trim() || null,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          college: college.trim(),
          degree: degree.trim(),
          department: department.trim(),
          passout_year: passoutYear.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) {
        toast.error(error.message || "Failed to update profile.");
        setIsLoading(false);
        return;
      }

      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="space-y-8 max-w-4xl">
      {/* ────────────────── IDENTITY HEADER (READ-ONLY) ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative h-24 w-24 rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-inner">
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt={fullName}
              fill
              className="object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-slate-400" />
          )}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-black text-slate-900">{fullName}</h2>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
              ID: {profile.student_id}
            </span>
          </div>
          <p className="text-xs text-slate-500">{profile.email}</p>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold rounded-xl h-8 gap-1.5 mt-2"
          >
            <Upload className="h-3.5 w-3.5 text-blue-600" />
            <span>Change Profile Picture</span>
          </Button>
        </div>
      </div>

      {/* ────────────────── RESUME / CV SECTION ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>Default Resume / CV</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your saved resume will auto-fill automatically whenever you apply for any internship.
            </p>
          </div>

          <input
            type="file"
            ref={resumeInputRef}
            accept="application/pdf"
            onChange={handleResumeSelect}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isResumeUploading}
            onClick={() => resumeInputRef.current?.click()}
            className="text-xs font-bold rounded-xl h-9 px-4 gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 shrink-0"
          >
            {isResumeUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
            ) : (
              <Upload className="h-3.5 w-3.5 text-blue-600" />
            )}
            <span>{resumePreview ? "Update Resume (PDF)" : "Upload Resume (PDF)"}</span>
          </Button>
        </div>

        {resumePreview ? (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">
                  {resumeFileName || "Student_Resume.pdf"}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" /> Ready & saved on profile
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <a
                href={resumePreview}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 hover:underline text-xs bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-xs"
              >
                <span>View</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                type="button"
                onClick={handleRemoveResume}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Remove resume"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-1">
            <p className="text-xs font-semibold text-slate-700">No default resume saved</p>
            <p className="text-[11px] text-slate-500">
              Upload a PDF resume (max 2 MB). It will automatically populate for every internship application.
            </p>
          </div>
        )}
      </div>

      {/* ────────────────── SECTION 1: CONTACT INFO ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Phone className="h-4 w-4 text-blue-600" />
          <span>Contact Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
              Phone Number
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pr-2 border-r border-slate-200">
                +91
              </span>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                className="pl-14 h-11 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp" className="text-xs font-bold text-slate-700">
              WhatsApp Number
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pr-2 border-r border-slate-200">
                +91
              </span>
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                maxLength={10}
                className="pl-14 h-11 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────── SECTION 2: RESIDENTIAL LOCATION ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span>Address & Location</span>
        </h3>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-bold text-slate-700">
              Street / Area Address
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-11 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs font-bold text-slate-700">
                City
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                State
              </Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="h-11 rounded-xl text-sm">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pincode" className="text-xs font-bold text-slate-700">
                Pincode
              </Label>
              <Input
                id="pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                className="h-11 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────── SECTION 3: ACADEMIC DETAILS ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-blue-600" />
          <span>Academic Background</span>
        </h3>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="college" className="text-xs font-bold text-slate-700">
              College / University
            </Label>
            <Input
              id="college"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="h-11 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Degree
              </Label>
              <Select value={degree} onValueChange={setDegree}>
                <SelectTrigger className="h-11 rounded-xl text-sm">
                  <SelectValue placeholder="Select Degree" />
                </SelectTrigger>
                <SelectContent>
                  {DEGREES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-xs font-bold text-slate-700">
                Department / Branch
              </Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Passout Year
              </Label>
              <Select value={passoutYear} onValueChange={setPassoutYear}>
                <SelectTrigger className="h-11 rounded-xl text-sm">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {PASSOUT_YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 px-7 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Save Profile Changes</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
