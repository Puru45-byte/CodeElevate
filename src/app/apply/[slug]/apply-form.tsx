"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  step1PersonalSchema,
  step2AddressSchema,
  step3EducationSchema,
  step4InternshipSchema,
  step5AccountSchema,
  Step1PersonalData,
  Step2AddressData,
  Step3EducationData,
  Step4InternshipData,
  Step5AccountData,
  FullApplicationData,
} from "@/lib/validations/apply";
import { INDIAN_STATES, DEGREES, GENDERS, PASSOUT_YEARS } from "@/lib/constants";
import { Internship, Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Lock,
  Upload,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Building,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { addMonths, subDays, format } from "date-fns";

interface ApplyFormProps {
  initialInternship: Internship;
  allInternships: Internship[];
  existingProfile: Profile | null;
  isLoggedIn: boolean;
}

const STEPS = [
  { id: 1, name: "Personal", label: "Personal Details", icon: User },
  { id: 2, name: "Address", label: "Address & Location", icon: MapPin },
  { id: 3, name: "Education", label: "Academic Info", icon: GraduationCap },
  { id: 4, name: "Internship", label: "Track & Dates", icon: Briefcase },
  { id: 5, name: "Account", label: "Security & Account", icon: Lock },
];

const STORAGE_KEY = "codeelevate_apply_draft_v2";

export function ApplyForm({
  initialInternship,
  allInternships,
  existingProfile,
  isLoggedIn,
}: ApplyFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedInternship, setSelectedInternship] =
    useState<Internship>(initialInternship);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    existingProfile?.photo_url || null
  );
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<{
    message: string;
    loginUrl?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate default dates
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const defaultEndDateStr = format(
    subDays(addMonths(new Date(), 1), 1),
    "yyyy-MM-dd"
  );

  // Form State
  const [formData, setFormData] = useState<{
    step1: Partial<Step1PersonalData>;
    step2: Partial<Step2AddressData>;
    step3: Partial<Step3EducationData>;
    step4: Partial<Step4InternshipData>;
    step5: Partial<Step5AccountData>;
  }>({
    step1: {
      firstName: existingProfile?.first_name || "",
      lastName: existingProfile?.last_name || "",
      gender: existingProfile?.gender || "Male",
      dateOfBirth: existingProfile?.date_of_birth || "",
      phone: existingProfile?.phone || "",
      email: existingProfile?.email || "",
      whatsapp: existingProfile?.whatsapp || "",
      photoUrl: existingProfile?.photo_url || "",
    },
    step2: {
      address: existingProfile?.address || "",
      city: existingProfile?.city || "",
      state: existingProfile?.state || "Maharashtra",
      country: existingProfile?.country || "India",
      pincode: existingProfile?.pincode || "",
    },
    step3: {
      college: existingProfile?.college || "",
      degree: existingProfile?.degree || "B.Tech",
      department: existingProfile?.department || "",
      passoutYear: existingProfile?.passout_year || "2026",
    },
    step4: {
      internshipId: initialInternship.id,
      domain: initialInternship.title,
      type: "Internship",
      mode: "Remote",
      startDate: todayStr,
      endDate: defaultEndDateStr,
    },
    step5: {
      password: "",
      confirmPassword: "",
      referralCode: "",
      agreeToTerms: true,
    },
  });

  // If logged in and profile is complete, we can jump to step 4
  useEffect(() => {
    if (isLoggedIn && existingProfile?.first_name && existingProfile?.college) {
      setCurrentStep(4);
    }
  }, [isLoggedIn, existingProfile]);

  // Load draft from sessionStorage if not logged in
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoggedIn) {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({
            ...prev,
            step1: { ...prev.step1, ...parsed.step1 },
            step2: { ...prev.step2, ...parsed.step2 },
            step3: { ...prev.step3, ...parsed.step3 },
            step4: {
              ...prev.step4,
              ...parsed.step4,
              internshipId: initialInternship.id,
              domain: initialInternship.title,
            },
          }));
          if (parsed.photoPreview) {
            setPhotoPreview(parsed.photoPreview);
          }
        }
      } catch (e) {
        console.warn("Could not parse draft application data", e);
      }
    }
  }, [isLoggedIn, initialInternship]);

  // Save draft on change (excluding passwords)
  const saveDraft = (updated: typeof formData) => {
    if (typeof window !== "undefined" && !isLoggedIn) {
      try {
        const safeData = {
          step1: updated.step1,
          step2: updated.step2,
          step3: updated.step3,
          step4: updated.step4,
          photoPreview,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
      } catch (e) {
        console.warn("Could not save application draft", e);
      }
    }
  };

  // Step 1 Form
  const form1 = useForm<Step1PersonalData>({
    resolver: zodResolver(step1PersonalSchema),
    values: formData.step1 as Step1PersonalData,
  });

  // Step 2 Form
  const form2 = useForm<Step2AddressData>({
    resolver: zodResolver(step2AddressSchema),
    values: formData.step2 as Step2AddressData,
  });

  // Step 3 Form
  const form3 = useForm<Step3EducationData>({
    resolver: zodResolver(step3EducationSchema),
    values: formData.step3 as Step3EducationData,
  });

  // Step 4 Form
  const form4 = useForm<Step4InternshipData>({
    resolver: zodResolver(step4InternshipSchema),
    values: {
      internshipId: selectedInternship.id,
      domain: selectedInternship.title,
      type: "Internship",
      mode: "Remote",
      startDate: formData.step4.startDate || todayStr,
      endDate: formData.step4.endDate || defaultEndDateStr,
    },
  });

  // Step 5 Form
  const form5 = useForm<Step5AccountData>({
    resolver: zodResolver(step5AccountSchema),
    values: formData.step5 as Step5AccountData,
  });

  // Photo change handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image size must be less than 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoBase64(result);
    };
    reader.readAsDataURL(file);
  };

  // Start date change handler in step 4
  const handleStartDateChange = (val: string) => {
    try {
      const selected = new Date(val);
      if (!isNaN(selected.getTime())) {
        const calculatedEnd = subDays(addMonths(selected, 1), 1);
        const endStr = format(calculatedEnd, "yyyy-MM-dd");
        form4.setValue("startDate", val);
        form4.setValue("endDate", endStr);
      }
    } catch {
      form4.setValue("startDate", val);
    }
  };

  // Domain change in step 4
  const handleDomainChange = (internshipId: string) => {
    const found = allInternships.find((i) => i.id === internshipId);
    if (found) {
      setSelectedInternship(found);
      form4.setValue("internshipId", found.id);
      form4.setValue("domain", found.title);
    }
  };

  // Step Handlers
  const onStep1Next = form1.handleSubmit((data) => {
    const updated = { ...formData, step1: data };
    setFormData(updated);
    saveDraft(updated);
    setServerError(null);
    setCurrentStep(2);
  });

  const onStep2Next = form2.handleSubmit((data) => {
    const updated = { ...formData, step2: data };
    setFormData(updated);
    saveDraft(updated);
    setServerError(null);
    setCurrentStep(3);
  });

  const onStep3Next = form3.handleSubmit((data) => {
    const updated = { ...formData, step3: data };
    setFormData(updated);
    saveDraft(updated);
    setServerError(null);
    setCurrentStep(4);
  });

  const onStep4Next = form4.handleSubmit((data) => {
    const updated = { ...formData, step4: data };
    setFormData(updated);
    saveDraft(updated);
    setServerError(null);

    // If already logged in, we submit directly from step 4
    if (isLoggedIn) {
      executeSubmission(updated);
    } else {
      setCurrentStep(5);
    }
  });

  const onStep5Submit = form5.handleSubmit((data) => {
    const updated = { ...formData, step5: data };
    setFormData(updated);
    executeSubmission(updated);
  });

  // Final Submission
  const executeSubmission = async (fullData: typeof formData) => {
    setIsSubmitting(true);
    setServerError(null);

    const payload: FullApplicationData = {
      firstName: fullData.step1.firstName || "",
      lastName: fullData.step1.lastName || "",
      gender: fullData.step1.gender || "Male",
      dateOfBirth: fullData.step1.dateOfBirth || "",
      phone: fullData.step1.phone || "",
      email: fullData.step1.email || "",
      whatsapp: fullData.step1.whatsapp || "",
      photoUrl: fullData.step1.photoUrl || "",
      photoBase64: photoBase64 || undefined,
      address: fullData.step2.address || "",
      city: fullData.step2.city || "",
      state: fullData.step2.state || "",
      country: fullData.step2.country || "India",
      pincode: fullData.step2.pincode || "",
      college: fullData.step3.college || "",
      degree: fullData.step3.degree || "",
      department: fullData.step3.department || "",
      passoutYear: fullData.step3.passoutYear || "",
      internshipId: fullData.step4.internshipId || selectedInternship.id,
      domain: fullData.step4.domain || selectedInternship.title,
      type: "Internship",
      mode: "Remote",
      startDate: fullData.step4.startDate || todayStr,
      endDate: fullData.step4.endDate || defaultEndDateStr,
      password: isLoggedIn ? "" : fullData.step5.password || "",
      confirmPassword: isLoggedIn ? "" : fullData.step5.confirmPassword || "",
      referralCode: fullData.step5.referralCode || "",
    };

    try {
      const res = await fetch("/api/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        if (resData.isExistingUser) {
          setServerError({
            message: resData.error,
            loginUrl: `/login?redirect=/apply/${selectedInternship.slug}`,
          });
        } else {
          setServerError({ message: resData.error || "Application submission failed." });
        }
        setIsSubmitting(false);
        return;
      }

      // If new user was created, sign in to establish client session
      if (resData.isNewUser && resData.email && resData.password) {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({
          email: resData.email,
          password: resData.password,
        });
      }

      // Clear draft storage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEY);
      }

      toast.success("Application submitted successfully!");
      router.push("/dashboard/applications");
      router.refresh();
    } catch (err: any) {
      setServerError({
        message: err.message || "Network error. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const maxSteps = isLoggedIn ? 4 : 5;
  const progressPercent = Math.round((currentStep / maxSteps) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* ────────────────── HEADER & TRACK PREVIEW ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 p-2.5 shadow-sm ring-1 ring-blue-100">
            <Image
              src={
                selectedInternship.icon_url ||
                selectedInternship.icon ||
                "/icons/open-book.png"
              }
              alt={selectedInternship.title}
              width={38}
              height={38}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 font-bold border-blue-200 text-[10px]"
              >
                1 Month Remote Track
              </Badge>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 font-bold border-emerald-200 text-[10px]"
              >
                100% Free
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Apply for {selectedInternship.title}
            </h1>
            <p className="text-xs text-slate-500">
              Complete this 5-step registration to enroll in the upcoming batch.
            </p>
          </div>
        </div>

        {!isLoggedIn && (
          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-slate-400 block">Already registered?</span>
            <Link
              href={`/login?redirect=/apply/${selectedInternship.slug}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              <span>Log in to apply</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* ────────────────── STEPPER NAVIGATION (Collage Screen 3) ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-sm space-y-4">
        {/* Step Numbers Bar */}
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {STEPS.filter((s) => !isLoggedIn || s.id <= 4).map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!isDone && !isCurrent}
                onClick={() => isDone && setCurrentStep(step.id)}
                className={`group flex flex-col items-center gap-2 p-2 rounded-2xl transition-all text-center ${
                  isCurrent
                    ? "bg-blue-50/80 text-blue-700 font-bold ring-1 ring-blue-200"
                    : isDone
                    ? "text-slate-700 hover:bg-slate-50 cursor-pointer"
                    : "text-slate-400 opacity-60 cursor-not-allowed"
                }`}
              >
                <div
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-transform ${
                    isCurrent
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
                      : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[11px] font-bold leading-tight line-clamp-1">
                    {step.name}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                    Step {step.id}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>
              Step {currentStep} of {maxSteps}: {STEPS[currentStep - 1]?.label}
            </span>
            <span className="text-blue-600 font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ────────────────── SERVER ERROR BANNER ────────────────── */}
      {serverError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 flex items-start gap-3.5 text-sm text-red-800 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="font-semibold text-xs sm:text-sm">{serverError.message}</p>
            {serverError.loginUrl && (
              <Link href={serverError.loginUrl}>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold gap-1.5 h-8 mt-1"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── STEP FORMS ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xl shadow-slate-200/30">
        {/* ──────── STEP 1: PERSONAL DETAILS ──────── */}
        {currentStep === 1 && (
          <form onSubmit={onStep1Next} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Step 1: Personal Information</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your identity and contact information as they should appear on your verified certificate.
              </p>
            </div>

            {/* Profile Photo Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">
                Profile Photo (Optional - max 2 MB)
              </Label>
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md flex items-center justify-center">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold rounded-xl h-9 gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5 text-blue-600" />
                      <span>{photoPreview ? "Change Photo" : "Upload Photo"}</span>
                    </Button>
                    {photoPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPhotoPreview(null);
                          setPhotoBase64(null);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-9"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    PNG, JPG or WebP. This will appear on your student profile.
                  </p>
                  {photoError && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {photoError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* First Name */}
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-bold text-slate-700">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="e.g. Alex"
                  className="h-11 rounded-xl text-sm"
                  {...form1.register("firstName")}
                />
                {form1.formState.errors.firstName && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form1.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-bold text-slate-700">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="e.g. Johnson"
                  className="h-11 rounded-xl text-sm"
                  {...form1.register("lastName")}
                />
                {form1.formState.errors.lastName && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form1.formState.errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="gender"
                  control={form1.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || "Male"}>
                      <SelectTrigger className="h-11 rounded-xl text-sm">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form1.formState.errors.gender && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form1.formState.errors.gender.message}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <Label htmlFor="dateOfBirth" className="text-xs font-bold text-slate-700">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="h-11 rounded-xl text-sm"
                  {...form1.register("dateOfBirth")}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 border-r border-slate-200 pr-2">
                    +91
                  </div>
                  <Input
                    id="phone"
                    placeholder="9876543210"
                    maxLength={10}
                    className="pl-14 h-11 rounded-xl text-sm"
                    {...form1.register("phone")}
                  />
                </div>
                {form1.formState.errors.phone && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form1.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@college.edu"
                  className="h-11 rounded-xl text-sm"
                  {...form1.register("email")}
                />
                {form1.formState.errors.email && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form1.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="whatsapp" className="text-xs font-bold text-slate-700">
                  WhatsApp Number (Optional for task updates)
                </Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 border-r border-slate-200 pr-2">
                    +91
                  </div>
                  <Input
                    id="whatsapp"
                    placeholder="9876543210 (Optional)"
                    maxLength={10}
                    className="pl-14 h-11 rounded-xl text-sm"
                    {...form1.register("whatsapp")}
                  />
                </div>
                {form1.formState.errors.whatsapp && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form1.formState.errors.whatsapp.message}
                  </p>
                )}
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <Button
                type="submit"
                className="h-11 px-6 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 gap-2"
              >
                <span>Continue to Address</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* ──────── STEP 2: ADDRESS & LOCATION ──────── */}
        {currentStep === 2 && (
          <form onSubmit={onStep2Next} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Step 2: Address & Location</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide your current residential address for official dispatch and records.
              </p>
            </div>

            <div className="space-y-5">
              {/* Street Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-bold text-slate-700">
                  Street / Area / Apartment (Optional)
                </Label>
                <Input
                  id="address"
                  placeholder="e.g. 124 Park Avenue, Flat 402"
                  className="h-11 rounded-xl text-sm"
                  {...form2.register("address")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* City */}
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-bold text-slate-700">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g. Pune"
                    className="h-11 rounded-xl text-sm"
                    {...form2.register("city")}
                  />
                  {form2.formState.errors.city && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {form2.formState.errors.city.message}
                    </p>
                  )}
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="state"
                    control={form2.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "Maharashtra"}
                      >
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
                    )}
                  />
                  {form2.formState.errors.state && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {form2.formState.errors.state.message}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-bold text-slate-700">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    defaultValue="India"
                    readOnly
                    className="h-11 rounded-xl text-sm bg-slate-50 text-slate-500"
                    {...form2.register("country")}
                  />
                </div>

                {/* Pincode */}
                <div className="space-y-1.5">
                  <Label htmlFor="pincode" className="text-xs font-bold text-slate-700">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    placeholder="411001"
                    maxLength={6}
                    className="h-11 rounded-xl text-sm"
                    {...form2.register("pincode")}
                  />
                  {form2.formState.errors.pincode && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {form2.formState.errors.pincode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="h-11 px-5 rounded-xl text-sm font-bold gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button
                type="submit"
                className="h-11 px-6 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 gap-2"
              >
                <span>Continue to Education</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* ──────── STEP 3: ACADEMIC INFO ──────── */}
        {currentStep === 3 && (
          <form onSubmit={onStep3Next} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span>Step 3: Academic & College Info</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tell us about your current university degree and department.
              </p>
            </div>

            <div className="space-y-5">
              {/* College */}
              <div className="space-y-1.5">
                <Label htmlFor="college" className="text-xs font-bold text-slate-700">
                  College / University Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="college"
                    placeholder="e.g. National Institute of Technology"
                    className="pl-10 h-11 rounded-xl text-sm"
                    {...form3.register("college")}
                  />
                </div>
                {form3.formState.errors.college && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form3.formState.errors.college.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Degree */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Degree <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="degree"
                    control={form3.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "B.Tech"}
                      >
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
                    )}
                  />
                  {form3.formState.errors.degree && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {form3.formState.errors.degree.message}
                    </p>
                  )}
                </div>

                {/* Department / Branch */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="department" className="text-xs font-bold text-slate-700">
                    Department / Branch <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="department"
                    placeholder="e.g. Computer Science"
                    className="h-11 rounded-xl text-sm"
                    {...form3.register("department")}
                  />
                  {form3.formState.errors.department && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {form3.formState.errors.department.message}
                    </p>
                  )}
                </div>

                {/* Passout Year */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-xs font-bold text-slate-700">
                    Passout Year <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="passoutYear"
                    control={form3.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "2026"}
                      >
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
                    )}
                  />
                  {form3.formState.errors.passoutYear && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {form3.formState.errors.passoutYear.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="h-11 px-5 rounded-xl text-sm font-bold gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button
                type="submit"
                className="h-11 px-6 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 gap-2"
              >
                <span>Continue to Track Selection</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* ──────── STEP 4: INTERNSHIP SELECTION & DATES ──────── */}
        {currentStep === 4 && (
          <form onSubmit={onStep4Next} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span>Step 4: Internship Track & Schedule</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Confirm your selected domain track and choose your preferred start date.
              </p>
            </div>

            <div className="space-y-5">
              {/* Domain Switcher */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Internship Track / Domain <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedInternship.id}
                  onValueChange={handleDomainChange}
                >
                  <SelectTrigger className="h-12 rounded-xl text-sm font-bold">
                    <SelectValue placeholder="Select Internship Track" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {allInternships.map((internship) => (
                      <SelectItem key={internship.id} value={internship.id}>
                        {internship.title} ({internship.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type and Mode (Read Only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Program Type
                  </Label>
                  <div className="h-11 rounded-xl bg-slate-50 border border-slate-200 px-3.5 flex items-center text-sm font-semibold text-slate-700">
                    Practical Internship Program
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Mode of Learning
                  </Label>
                  <div className="h-11 rounded-xl bg-slate-50 border border-slate-200 px-3.5 flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>100% Remote / Online</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                      Self-Paced
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Start and End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-xs font-bold text-slate-700">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    min={todayStr}
                    defaultValue={form4.getValues("startDate") || todayStr}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="h-11 rounded-xl text-sm font-medium"
                  />
                  {form4.formState.errors.startDate && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {form4.formState.errors.startDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="text-xs font-bold text-slate-700">
                    End Date (1 Month Duration)
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    readOnly
                    value={form4.watch("endDate") || defaultEndDateStr}
                    className="h-11 rounded-xl text-sm font-medium bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400">
                    Auto-computed: exactly 1 month from start date.
                  </p>
                </div>
              </div>

              {/* Perks summary card */}
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 sm:p-5 space-y-2.5">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Included in this Internship
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Real-world practical milestones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Verified completion certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Downloadable learning resources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>GitHub portfolio code evaluation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(3)}
                className="h-11 px-5 rounded-xl text-sm font-bold gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-6 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : isLoggedIn ? (
                  <>
                    <span>Submit Application</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Continue to Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ──────── STEP 5: ACCOUNT & SECURITY (FOR NEW USERS) ──────── */}
        {currentStep === 5 && !isLoggedIn && (
          <form onSubmit={onStep5Submit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                <span>Step 5: Account & Password</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Create a password for your CodeElevate student account. You will use this to log in to your dashboard.
              </p>
            </div>

            <div className="space-y-5">
              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars (letters + numbers)"
                    className="pl-10 pr-10 h-11 rounded-xl text-sm"
                    {...form5.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form5.formState.errors.password && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form5.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    className="pl-10 pr-10 h-11 rounded-xl text-sm"
                    {...form5.register("confirmPassword")}
                  />
                </div>
                {form5.formState.errors.confirmPassword && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form5.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Referral Code */}
              <div className="space-y-1.5">
                <Label htmlFor="referralCode" className="text-xs font-bold text-slate-700">
                  Referral Code (Optional)
                </Label>
                <Input
                  id="referralCode"
                  placeholder="e.g. CE-CAMPUS-2026"
                  className="h-11 rounded-xl text-sm uppercase"
                  {...form5.register("referralCode")}
                />
              </div>

              {/* Consent checkbox */}
              <div className="space-y-1 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                  <input
                    type="checkbox"
                    {...form5.register("agreeToTerms")}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    I agree to CodeElevate&apos;s{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold underline hover:text-blue-800"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold underline hover:text-blue-800"
                    >
                      Privacy Policy
                    </Link>
                    . <span className="text-red-500">*</span>
                  </span>
                </label>
                {form5.formState.errors.agreeToTerms && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form5.formState.errors.agreeToTerms.message}
                  </p>
                )}
              </div>

              {/* Trust statement */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-500 leading-relaxed">
                By submitting this application, your account will be created instantly and you will gain access to your student dashboard.
              </div>
            </div>

            {/* Step 5 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(4)}
                className="h-11 px-5 rounded-xl text-sm font-bold gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-7 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Create Account</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
