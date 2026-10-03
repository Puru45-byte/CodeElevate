"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Github,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubmitTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  onSuccess?: () => void;
}

type Step = "FORM" | "LOADING" | "SUCCESS" | "FAILED";

export function SubmitTaskDialog({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  onSuccess,
}: SubmitTaskDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("FORM");
  const [githubUrl, setGithubUrl] = useState("");
  const [comments, setComments] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingText, setLoadingText] = useState("Preparing submission...");
  const [isCheckoutActive, setIsCheckoutActive] = useState(false);

  // GitHub repository URL regex: https://github.com/{owner}/{repo} (optional trailing slash or .git)
  const githubRepoRegex =
    /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\/|\.git)?$/;

  const validateUrl = (url: string): boolean => {
    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMessage("GitHub repository URL is required.");
      return false;
    }
    if (!trimmed.startsWith("https://github.com/")) {
      setErrorMessage("URL must start with https://github.com/");
      return false;
    }
    if (trimmed.includes("gist.github.com")) {
      setErrorMessage("Gists are not accepted. Please provide a repository URL.");
      return false;
    }
    if (!githubRepoRegex.test(trimmed)) {
      setErrorMessage(
        "Please enter a valid GitHub repository URL (e.g. https://github.com/username/project)"
      );
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existingScript) {
        if ((window as any).Razorpay) {
          resolve(true);
        } else {
          existingScript.addEventListener("load", () => resolve(true));
          existingScript.addEventListener("error", () => resolve(false));
          setTimeout(() => resolve(!!(window as any).Razorpay), 1000);
        }
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(githubUrl)) {
      return;
    }

    setStep("LOADING");
    setLoadingText("Preparing submission...");

    try {
      // 1. Create Razorpay Order
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          githubUrl: githubUrl.trim(),
          comments: comments.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate submission process.");
      }

      // If free resubmission
      if (data.freeSubmission) {
        setStep("SUCCESS");
        toast.success("Task resubmitted for review!");
        if (onSuccess) onSuccess();
        router.refresh();
        return;
      }

      if (!data.orderId || !data.keyId) {
        throw new Error("Payment gateway configuration error. Please check server configuration.");
      }

      // 2. Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || typeof (window as any).Razorpay === "undefined") {
        throw new Error("Failed to load payment checkout SDK. Please check your internet connection.");
      }

      // Temporarily hide Radix dialog to prevent focus-trap loop with Razorpay iframe
      setIsCheckoutActive(true);

      // 3. Open Razorpay Checkout Window
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "CodeElevate",
        description: `Task Evaluation - ${taskTitle}`,
        order_id: data.orderId,
        prefill: {
          name: data.user?.name || "",
          email: data.user?.email || "",
          contact: data.user?.phone || "",
        },
        theme: {
          color: "#1D4ED8",
        },
        modal: {
          ondismiss: () => {
            setIsCheckoutActive(false);
            setStep("FAILED");
            toast.error("Payment was cancelled. Your task has not been submitted.");
          },
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          setIsCheckoutActive(false);
          setStep("LOADING");
          setLoadingText("Verifying payment and submitting task...");

          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(
                verifyData.error || "Payment verification failed on the server."
              );
            }

            setStep("SUCCESS");
            toast.success("Task submitted for review!");
            if (onSuccess) onSuccess();
            router.refresh();
          } catch (verifyErr: any) {
            console.error("Verification error:", verifyErr);
            setStep("FAILED");
            toast.error(
              verifyErr.message || "Failed to verify payment with server."
            );
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (failResponse: any) {
        console.error("Razorpay payment.failed:", failResponse);
        setIsCheckoutActive(false);
        setStep("FAILED");
        toast.error(
          failResponse.error?.description || "Payment transaction was declined."
        );
      });

      rzp.open();
    } catch (err: any) {
      console.error("Submission flow error:", err);
      setIsCheckoutActive(false);
      setStep("FAILED");
      toast.error(err.message || "Something went wrong.");
    }
  };

  const handleModalClose = () => {
    if (step === "LOADING" || isCheckoutActive) return;
    if (step === "SUCCESS") {
      setStep("FORM");
      setGithubUrl("");
      setComments("");
    } else if (step === "FAILED") {
      setStep("FORM");
    }
    onClose();
  };

  const dialogVisible = isOpen && !isCheckoutActive;

  return (
    <Dialog open={dialogVisible} onOpenChange={handleModalClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (step === "LOADING" || isCheckoutActive) e.preventDefault();
        }}
        className="max-w-lg rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-xl"
      >
        {/* ──────── STEP: FORM ──────── */}
        {step === "FORM" && (
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                Submit Task: {taskTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Provide your GitHub repository link containing your milestone
                implementation.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleContinue} className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="github-url"
                  className="text-xs font-bold text-slate-700"
                >
                  GitHub Repository URL <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="github-url"
                    placeholder="https://github.com/username/project"
                    value={githubUrl}
                    onChange={(e) => {
                      setGithubUrl(e.target.value);
                      if (errorMessage) validateUrl(e.target.value);
                    }}
                    className={`pl-10 h-11 rounded-xl text-xs sm:text-sm font-mono ${
                      errorMessage ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    required
                  />
                </div>
                {errorMessage && (
                  <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="comments"
                    className="text-xs font-bold text-slate-700"
                  >
                    Additional Comments
                  </Label>
                  <span className="text-[10px] text-slate-400">
                    {comments.length}/500
                  </span>
                </div>
                <Textarea
                  id="comments"
                  placeholder="Notes on features implemented, setup instructions, or live demo URLs..."
                  value={comments}
                  maxLength={500}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleModalClose}
                  className="rounded-xl text-xs font-semibold h-10 px-4 text-slate-600 border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="rounded-xl text-xs font-bold h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-1.5"
                >
                  <span>Continue →</span>
                </Button>
              </div>
            </form>
          </>
        )}

        {/* ──────── STEP: LOADING ──────── */}
        {step === "LOADING" && (
          <div className="py-12 px-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                {loadingText}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Please wait while we establish a secure session with the gateway.
              </p>
            </div>
          </div>
        )}

        {/* ──────── STEP: FAILED ──────── */}
        {step === "FAILED" && (
          <div className="py-6 px-2 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Payment Incomplete
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Payment was not completed. Your task has not been submitted.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Repository link saved:
              </span>
              <p className="font-mono text-slate-800 text-[11px] truncate">
                {githubUrl}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep("FORM")}
                className="rounded-xl text-xs font-bold h-10 px-5 border-slate-200 text-slate-700"
              >
                Edit URL
              </Button>

              <Button
                onClick={handleContinue}
                className="rounded-xl text-xs font-bold h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Payment</span>
              </Button>
            </div>
          </div>
        )}

        {/* ──────── STEP: SUCCESS ──────── */}
        {step === "SUCCESS" && (
          <div className="py-6 px-2 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                ✓ Task Submitted Successfully
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your payment was successful and your task has been submitted for
                review.
              </p>
              <div className="inline-block bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-3 py-0.5 text-xs font-bold mt-1">
                Status: Under Review
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleModalClose}
                className="rounded-xl text-xs font-bold h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-sm gap-1.5"
              >
                <span>Back to Task</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
