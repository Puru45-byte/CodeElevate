"use client";

import React, { useState } from "react";
import { Internship } from "@/types/database";
import { Modal } from "@/components/shared/Modal";
import { FormInput } from "@/components/shared/FormInput";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, User, Mail, Lock, Building, Calendar } from "lucide-react";
import Image from "next/image";

interface ApplyModalProps {
  course: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApplyModal({
  course,
  isOpen,
  onClose,
  onSuccess,
}: ApplyModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  if (!course) return null;

  const iconSrc = course.icon_url || course.icon || "/icons/open-book.png";

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Check if user is already logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const response = await fetch("/api/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          fullName: user ? undefined : fullName,
          email: user ? user.email : email,
          password: user ? undefined : password,
          college,
          graduationYear,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      // If user was newly created and signed in, refresh
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      setIsSuccess(true);
      toast.success("Application submitted successfully!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "An error occurred while submitting application.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? "Application Submitted!" : "Apply for 1-Month Internship"}
      description={
        isSuccess
          ? "Your application has been received and is pending academic review."
          : `Apply for ${course.title} (Remote Track)`
      }
    >
      {isSuccess ? (
        <div className="space-y-4 py-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              You are all set!
            </h4>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Our academic coordinators review applications continuously. You can track your status anytime in your student dashboard.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="rounded-xl"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                handleClose();
                router.push("/dashboard");
              }}
              className="rounded-xl gap-1.5"
            >
              <span>Go to Dashboard</span>
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleApply} className="space-y-4 pt-1">
          <div className="flex items-center gap-3 rounded-xl bg-blue-50/70 p-3 border border-blue-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm p-1.5">
              <Image
                src={iconSrc}
                alt={course.title}
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900">{course.title}</p>
              <p className="text-[11px] text-blue-700">Duration: {course.duration_months || 1} Month • Mode: Remote</p>
            </div>
          </div>

          <div className="space-y-3">
            <FormInput
              id="fullName"
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              icon={<User className="h-4 w-4" />}
            />

            <FormInput
              id="email"
              type="email"
              label="Email Address"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail className="h-4 w-4" />}
            />

            <FormInput
              id="password"
              type="password"
              label="Account Password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              icon={<Lock className="h-4 w-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                id="college"
                label="College / Institute"
                placeholder="e.g. IIT Bombay / NIT"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                required
                icon={<Building className="h-4 w-4" />}
              />

              <FormInput
                id="gradYear"
                label="Graduation Year"
                placeholder="e.g. 2026"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                required
                icon={<Calendar className="h-4 w-4" />}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="rounded-xl font-semibold shadow-md shadow-blue-500/20"
            >
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
