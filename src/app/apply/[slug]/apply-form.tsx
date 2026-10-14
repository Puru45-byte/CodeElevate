"use client";

import React, { useState, useRef } from "react";
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
  Step1PersonalData,
  Step2AddressData,
  Step3EducationData,
  Step4InternshipData,
  FullApplicationData,
} from "@/lib/validations/apply";
import { INDIAN_STATES, DEGREES, GENDERS, PASSOUT_YEARS } from "@/lib/constants";
import { Internship, Profile } from "@/types/database";
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
  AlertCircle,
  Loader2,
  Building,
  Check,
  FileText,
  ExternalLink,
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
];

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

  // If logged out: render the small gate card
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-200/40 text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
            <Lock className="h-7 w-7 text-blue-600" />
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50 text-[11px] font-bold">
              {selectedInternship.title}
            </Badge>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Create an account or log in to apply for {selectedInternship.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              You must have a verified student account before submitting your application.
              Your account gives you access to the curriculum, tasks, and certification.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button asChild className="w-full h-11 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 gap-2">
              <Link href={`/register?next=/apply/${encodeURIComponent(selectedInternship.slug)}`}>
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full h-11 rounded-xl text-sm font-bold border-slate-200 hover:bg-slate-50 text-slate-700">
              <Link href={`/login?next=/apply/${encodeURIComponent(selectedInternship.slug)}`}>
                <span>Log In</span>
              </Link>
            </Button>
          </div>

          <p className="text-[11px] text-slate-400">
            Application is 100% free with no upfront fees.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ApplyFormInner
      selectedInternship={selectedInternship}
      setSelectedInternship={setSelectedInternship}
      allInternships={allInternships}
      existingProfile={existingProfile}
      router={router}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
    />
  );
}

function ApplyFormInner({
  selectedInternship,
  setSelectedInternship,
  allInternships,
  existingProfile,
  router,
  currentStep,
  setCurrentStep,
}: {
  selectedInternship: Internship;
  setSelectedInternship: (i: Internship) => void;
  allInternships: Internship[];
  existingProfile: Profile | null;
  router: any;
  currentStep: number;
  setCurrentStep: (s: number) => void;
}) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    existingProfile?.photo_url || null
  );
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [resumePreview, setResumePreview] = useState<string | null>(
    existingProfile?.resume_url || null
  );
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(
    existingProfile?.resume_file_name || null
  );
  const [resumeFileSize, setResumeFileSize] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [isResumeUploading, setIsResumeUploading] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<{ message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

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
  }>({
    step1: {
      firstName: existingProfile?.first_name || "",
      lastName: existingProfile?.last_name || "",
      email: existingProfile?.email || "",
      gender: existingProfile?.gender || "Male",
      dateOfBirth: existingProfile?.date_of_birth
        ? format(new Date(existingProfile.date_of_birth), "yyyy-MM-dd")
        : "",
      phone: existingProfile?.phone || "",
      whatsapp: existingProfile?.whatsapp || "",
      photoUrl: existingProfile?.photo_url || "",
      resumeUrl: existingProfile?.resume_url || "",
      resumeFileName: existingProfile?.resume_file_name || "",
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
      internshipId: selectedInternship.id,
      domain: selectedInternship.title,
      type: "Internship",
      mode: "Remote",
      startDate: todayStr,
      endDate: defaultEndDateStr,
    },
  });

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

  // Resume change handler
  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setResumeError("Please select a valid PDF file (.pdf).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setResumeError("Resume file size must be less than 2 MB.");
      return;
    }

    setIsResumeUploading(true);
    const formattedSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setResumePreview(result);
      setResumeBase64(result);
      setResumeFileName(file.name);
      setResumeFileSize(formattedSize);
      setIsResumeUploading(false);
      form1.setValue("resumeUrl", result);
      setResumeError(null);
    };
    reader.onerror = () => {
      setResumeError("Failed to read the PDF file. Please try again.");
      setIsResumeUploading(false);
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
    const hasResume =
      data.resumeUrl ||
      resumePreview ||
      formData.step1.resumeUrl ||
      existingProfile?.resume_url;

    if (!hasResume) {
      setResumeError("Resume / CV is required. Please upload your resume in PDF format.");
      return;
    }

    setResumeError(null);
    const updated = {
      ...formData,
      step1: {
        ...data,
        resumeUrl: data.resumeUrl || (resumePreview as string) || existingProfile?.resume_url || "",
      },
    };
    setFormData(updated);
    setServerError(null);
    setCurrentStep(2);
  });

  const onStep2Next = form2.handleSubmit((data) => {
    const updated = { ...formData, step2: data };
    setFormData(updated);
    setServerError(null);
    setCurrentStep(3);
  });

  const onStep3Next = form3.handleSubmit((data) => {
    const updated = { ...formData, step3: data };
    setFormData(updated);
    setServerError(null);
    setCurrentStep(4);
  });

  const onStep4Submit = form4.handleSubmit((data) => {
    const updated = { ...formData, step4: data };
    setFormData(updated);
    setServerError(null);
    executeSubmission(updated);
  });

  // Final Submission to API
  const executeSubmission = async (fullData: typeof formData) => {
    setIsSubmitting(true);
    setServerError(null);

    const payload: FullApplicationData = {
      firstName: existingProfile?.first_name || fullData.step1.firstName || "",
      lastName: existingProfile?.last_name || fullData.step1.lastName || "",
      email: existingProfile?.email || fullData.step1.email || "",
      gender: fullData.step1.gender || "Male",
      dateOfBirth: fullData.step1.dateOfBirth || "",
      phone: fullData.step1.phone || "",
      whatsapp: fullData.step1.whatsapp || "",
      photoUrl: fullData.step1.photoUrl || "",
      photoBase64: photoBase64 || undefined,
      resumeUrl: fullData.step1.resumeUrl || (resumePreview && !resumePreview.startsWith("data:") ? resumePreview : ""),
      resumeFileName: fullData.step1.resumeFileName || resumeFileName || "",
      resumeBase64: resumeBase64 || undefined,
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
    };

    try {
      const res = await fetch("/api/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        setServerError({ message: resData.error || "Application submission failed." });
        setIsSubmitting(false);
        return;
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

  const progressPercent = Math.round((currentStep / 4) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* HEADER & TRACK PREVIEW */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 p-2.5 shadow-sm ring-1 ring-blue-100">
            <Image
              src={
                selectedInternship.icon_url ||
                (selectedInternship as any).icon ||
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
              Complete this application to enroll in the upcoming batch.
            </p>
          </div>
        </div>
      </div>

      {/* STEPPER NAVIGATION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-sm space-y-4">
        {/* Step Numbers Bar */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (isDone) setCurrentStep(step.id);
                }}
                disabled={!isDone && !isCurrent}
                className={`flex flex-col sm:flex-row items-center sm:items-start gap-2.5 p-3 rounded-2xl text-left transition-all ${
                  isCurrent
                    ? "bg-blue-50/80 border border-blue-200 ring-2 ring-blue-600/10"
                    : isDone
                    ? "hover:bg-slate-50 border border-transparent cursor-pointer"
                    : "opacity-40 border border-transparent cursor-not-allowed"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-colors ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Step {step.id}
                  </div>
                  <div
                    className={`text-xs font-bold truncate ${
                      isCurrent ? "text-blue-900" : "text-slate-700"
                    }`}
                  >
                    {step.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* SERVER ERROR BANNER */}
      {serverError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-900">Application Error</h3>
            <p className="text-xs text-red-700">{serverError.message}</p>
          </div>
        </div>
      )}

      {/* STEP FORMS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xl shadow-slate-200/30">
        {/* STEP 1: PERSONAL DETAILS */}
        {currentStep === 1 && (
          <form onSubmit={onStep1Next} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Step 1: Personal Information</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your name and email are pre-filled from your verified student account.
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

            {/* Resume / CV Upload */}
            <div className="space-y-2">
              <Label htmlFor="resumeInput" className="text-xs font-bold text-slate-700">
                Resume / CV <span className="text-red-500">*</span> (PDF required - max 2 MB)
              </Label>
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md flex items-center justify-center">
                  {isResumeUploading ? (
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  ) : resumePreview ? (
                    <FileText className="h-8 w-8 text-blue-600" />
                  ) : (
                    <Upload className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <input
                    id="resumeInput"
                    type="file"
                    ref={resumeInputRef}
                    accept="application/pdf"
                    onChange={handleResumeSelect}
                    className="hidden"
                  />
                  {resumePreview ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-xs block">
                          {resumeFileName || "Student_Resume.pdf"}
                        </span>
                        {resumeFileSize && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            ({resumeFileSize})
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 h-4"
                        >
                          Ready
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => resumeInputRef.current?.click()}
                          className="text-xs font-bold rounded-xl h-9 gap-1.5"
                        >
                          <Upload className="h-3.5 w-3.5 text-blue-600" />
                          <span>Replace Resume</span>
                        </Button>
                        {!resumePreview.startsWith("data:") && (
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-9 gap-1"
                          >
                            <a
                              href={resumePreview}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>View Current PDF</span>
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isResumeUploading}
                        onClick={() => resumeInputRef.current?.click()}
                        className="text-xs font-bold rounded-xl h-9 gap-1.5"
                      >
                        {isResumeUploading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5 text-blue-600" />
                            <span>Upload Resume</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400">
                    PDF only. Max 2 MB. Upload your latest resume.
                  </p>
                  {resumeError && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {resumeError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* First Name (Locked) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="firstName" className="text-xs font-bold text-slate-700">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Lock className="h-3 w-3" /> Account locked
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="firstName"
                    type="text"
                    readOnly
                    className="pl-10 h-11 rounded-xl text-sm bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed select-none font-medium"
                    {...form1.register("firstName")}
                  />
                </div>
                {form1.formState.errors.firstName && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form1.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name (Locked) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lastName" className="text-xs font-bold text-slate-700">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Lock className="h-3 w-3" /> Account locked
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="lastName"
                    type="text"
                    readOnly
                    className="pl-10 h-11 rounded-xl text-sm bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed select-none font-medium"
                    {...form1.register("lastName")}
                  />
                </div>
                {form1.formState.errors.lastName && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form1.formState.errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email Address (Locked) */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Lock className="h-3 w-3" /> Account locked
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    readOnly
                    className="pl-10 h-11 rounded-xl text-sm bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed select-none font-medium"
                    {...form1.register("email")}
                  />
                </div>
                {form1.formState.errors.email && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form1.formState.errors.email.message}
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

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-xs font-bold text-slate-700">
                  WhatsApp Number (Optional)
                </Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 border-r border-slate-200 pr-2">
                    +91
                  </div>
                  <Input
                    id="whatsapp"
                    placeholder="Same as phone number"
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
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                type="submit"
                className="h-11 px-6 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 gap-2"
              >
                <span>Next: Address & Location</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: ADDRESS */}
        {currentStep === 2 && (
          <form onSubmit={onStep2Next} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Step 2: Address & Location</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide your permanent address for certificate dispatch and record verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address" className="text-xs font-bold text-slate-700">
                  Address Line (Optional)
                </Label>
                <Input
                  id="address"
                  placeholder="Flat / House No., Street, Landmark"
                  className="h-11 rounded-xl text-sm"
                  {...form2.register("address")}
                />
              </div>

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

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  State <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="state"
                  control={form2.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || "Maharashtra"}>
                      <SelectTrigger className="h-11 rounded-xl text-sm">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
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

              <div className="space-y-1.5">
                <Label htmlFor="pincode" className="text-xs font-bold text-slate-700">
                  Pincode <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pincode"
                  placeholder="e.g. 411001"
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

              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs font-bold text-slate-700">
                  Country
                </Label>
                <Input
                  id="country"
                  readOnly
                  disabled
                  value="India"
                  className="h-11 rounded-xl text-sm bg-slate-50 cursor-not-allowed"
                />
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
                <span>Next: Academic Info</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: EDUCATION */}
        {currentStep === 3 && (
          <form onSubmit={onStep3Next} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span>Step 3: Academic Information</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your college details. These credentials will be verified by mentors during code evaluation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="college" className="text-xs font-bold text-slate-700">
                  College / University <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="college"
                    placeholder="e.g. Pune Institute of Computer Technology"
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

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Degree <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="degree"
                  control={form3.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || "B.Tech"}>
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

              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs font-bold text-slate-700">
                  Department / Branch <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="department"
                  placeholder="e.g. Computer Engineering"
                  className="h-11 rounded-xl text-sm"
                  {...form3.register("department")}
                />
                {form3.formState.errors.department && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {form3.formState.errors.department.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Passout Year <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="passoutYear"
                  control={form3.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || "2026"}>
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
                <span>Next: Internship Track</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 4: INTERNSHIP SELECTION & DATES */}
        {currentStep === 4 && (
          <form onSubmit={onStep4Submit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span>Step 4: Internship Track & Preferred Dates</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your internship domain and preferred batch start date.
              </p>
            </div>

            <div className="space-y-5">
              {/* Domain Switcher */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Internship Track <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedInternship.id}
                  onValueChange={handleDomainChange}
                >
                  <SelectTrigger className="h-12 rounded-xl text-sm font-semibold">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {allInternships.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-xs font-bold text-slate-700">
                    Preferred Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    min={todayStr}
                    className="h-11 rounded-xl text-sm font-medium"
                    {...form4.register("startDate", {
                      onChange: (e) => handleStartDateChange(e.target.value),
                    })}
                  />
                  {form4.formState.errors.startDate && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {form4.formState.errors.startDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="text-xs font-bold text-slate-700">
                    Calculated Completion Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    readOnly
                    disabled
                    className="h-11 rounded-xl text-sm bg-slate-50 font-medium text-slate-600 cursor-not-allowed"
                    {...form4.register("endDate")}
                  />
                  <p className="text-[11px] text-slate-400">
                    Standard 1-month duration (start + 1 month - 1 day).
                  </p>
                </div>
              </div>

              {/* Mode & Type Info */}
              <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">Program Mode:</span>
                  <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 text-xs font-bold">
                    100% Remote / Self-Paced
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Real-world production engineering tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Mentorship and automated milestone tests</span>
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
                ) : (
                  <>
                    <span>Submit Application</span>
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
