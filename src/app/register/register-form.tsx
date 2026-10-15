"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/lib/validations/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { isSafeRedirect } from "@/lib/utils";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const loginHref = `/login${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    setIsExistingUser(false);
    setVerificationSent(false);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
          confirmPassword: data.confirmPassword,
          agreeToTerms: data.agreeToTerms,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setIsExistingUser(!!resData.isExistingUser);
        setErrorMessage(resData.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // PATH: email verification required — show message, do NOT sign in
      if (resData.requiresVerification) {
        setVerificationSent(true);
        setIsLoading(false);
        return;
      }

      // PATH: sign-in after create failed even after retry — go to login with toast
      if (resData.redirectToLogin) {
        toast.success(resData.message || "Account created. Please log in.");
        const sep = loginHref.includes("?") ? "&" : "?"; router.push(`${loginHref}${sep}registered=1`);
        return;
      }

      // PATH: success — server already set session cookies
      toast.success("Account created! Welcome to CodeElevate.");
      const destination = isSafeRedirect(next) ? next : "/internships";
      router.push(destination);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  }

  // Show verification-sent state
  if (verificationSent) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 shadow-sm border border-green-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Check Your Email
          </h1>
          <p className="text-sm text-slate-500">
            Please check your email to confirm your account before logging in.
          </p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-xs font-medium text-green-800 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
          <span>
            A confirmation email has been sent. Once confirmed, you can{" "}
            <Link href={loginHref} className="underline font-bold hover:text-green-900">
              log in here
            </Link>
            .
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
          <Code2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Create Account
        </h1>
        <p className="text-sm text-slate-500">
          Join CodeElevate to apply for internships and earn verified certificates.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <span>
            {isExistingUser ? (
              <>
                An account with this email already exists.{" "}
                <Link href={loginHref} className="underline font-bold hover:text-red-900">
                  Please log in.
                </Link>
              </>
            ) : (
              errorMessage
            )}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-xs font-bold text-slate-700">
              First Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="firstName"
                placeholder="Alex"
                className="pl-10 h-11 rounded-xl text-sm"
                {...register("firstName")}
              />
            </div>
            {errors.firstName && (
              <p className="text-[11px] text-red-600 font-medium">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-xs font-bold text-slate-700">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Johnson"
              className="h-11 rounded-xl text-sm"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-[11px] text-red-600 font-medium">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-email" className="text-xs font-bold text-slate-700">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              className="pl-10 h-11 rounded-xl text-sm"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-xs font-bold text-slate-700">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 chars (letters + numbers)"
              className="pl-10 pr-10 h-11 rounded-xl text-sm"
              {...register("password")}
            />
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-600 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-confirm-password" className="text-xs font-bold text-slate-700">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="reg-confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              className="pl-10 pr-10 h-11 rounded-xl text-sm"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-red-600 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms checkbox */}
        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
            <input
              type="checkbox"
              {...register("agreeToTerms")}
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
                Terms &amp; Conditions
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
          {errors.agreeToTerms && (
            <p className="text-[11px] text-red-600 font-medium">{errors.agreeToTerms.message}</p>
          )}
        </div>

        <Button
          type="submit"
          id="register-submit-btn"
          disabled={isLoading}
          className="w-full h-11 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
