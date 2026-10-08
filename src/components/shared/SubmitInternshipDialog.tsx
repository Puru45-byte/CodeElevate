"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
import Link from "next/link";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubmitInternshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  internshipTitle: string;
  onSuccess?: () => void;
}

type Step = "FORM" | "LOADING" | "SUCCESS" | "FAILED";

// GitHub repository URL regex: https://github.com/{owner}/{repo} (optional trailing slash or .git)
const githubRepoRegex =
  /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\/|\.git)?$/;

const CHECKOUT_JS_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Load checkout.js exactly once. Returns true if window.Razorpay is available.
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${CHECKOUT_JS_URL}"]`
    );
    if (existingScript) {
      // Script tag exists but SDK may still be loading
      if (window.Razorpay) {
        resolve(true);
      } else {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
      }
      return;
    }

    const script = document.createElement("script");
    script.src = CHECKOUT_JS_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Remove any leftover Radix body locks and Razorpay containers.
 */
function cleanupBodyLocks() {
  if (typeof document === "undefined") return;
  document.body.style.pointerEvents = "";
  document.body.style.overflow = "";
  document.body.removeAttribute("data-scroll-locked");
  document.body.removeAttribute("aria-hidden");
}

/**
 * Remove Razorpay's leftover backdrop container from the DOM.
 */
function removeRazorpayContainer() {
  if (typeof document === "undefined") return;
  const container = document.querySelector(".razorpay-container");
  if (container) {
    container.remove();
  }
  // Also remove any Razorpay backdrop overlay
  const backdrop = document.querySelector(".razorpay-backdrop");
  if (backdrop) {
    backdrop.remove();
  }
  cleanupBodyLocks();
}

export function SubmitInternshipDialog({
  isOpen,
  onClose,
  enrollmentId,
  internshipTitle,
  onSuccess,
}: SubmitInternshipDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("FORM");
  const [githubUrl, setGithubUrl] = useState("");
  const [comments, setComments] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingText, setLoadingText] = useState("Preparing submission...");
  const [isCheckoutActive, setIsCheckoutActive] = useState(false);

  // Guard against setState on unmounted component
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Store order data so we can retry without re-fetching
  const pendingOrderRef = useRef<{
    orderId: string;
    keyId: string;
    amount: number;
    currency: string;
    userName: string;
    userEmail: string;
    userPhone: string;
  } | null>(null);

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

  /**
   * Open the Razorpay checkout modal. Called AFTER the dialog is fully unmounted.
   */
  const openRazorpayCheckout = useCallback(
    (order: NonNullable<typeof pendingOrderRef.current>) => {
      try {
        if (typeof window === "undefined" || !window.Razorpay) {
          throw new Error("Payment SDK not available. Please refresh and try again.");
        }

        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "CodeElevate",
          description: "CodeElevate Internship Submission",
          order_id: order.orderId,
          prefill: {
            name: order.userName,
            email: order.userEmail,
            contact: order.userPhone,
          },
          theme: {
            color: "#1D4ED8",
          },
          modal: {
            ondismiss: () => {
              removeRazorpayContainer();
              if (isMountedRef.current) {
                setIsCheckoutActive(false);
                setStep("FAILED");
              }
              toast.error("Payment was cancelled. Your submission has not been processed.");
            },
          },
          handler: async function (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) {
            removeRazorpayContainer();

            if (isMountedRef.current) {
              setIsCheckoutActive(false);
              setStep("LOADING");
              setLoadingText("Verifying payment and submitting work...");
            }

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

              if (isMountedRef.current) {
                setStep("SUCCESS");
              }
              toast.success("Internship project submitted for review!");
              if (onSuccess) onSuccess();
              router.refresh();
            } catch (verifyErr: any) {
              console.error("Verification error:", verifyErr);
              if (isMountedRef.current) {
                setStep("FAILED");
              }
              toast.error(
                verifyErr.message || "Failed to verify payment with server."
              );
            }
          },
        };

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", function (failResponse: any) {
          console.error("Razorpay payment.failed:", failResponse);
          removeRazorpayContainer();
          if (isMountedRef.current) {
            setIsCheckoutActive(false);
            setStep("FAILED");
          }
          toast.error(
            failResponse.error?.description || "Payment transaction was declined."
          );
        });

        rzp.open();
      } catch (err: any) {
        console.error("Razorpay open error:", err);
        removeRazorpayContainer();
        if (isMountedRef.current) {
          setIsCheckoutActive(false);
          setStep("FAILED");
        }
        toast.error(err.message || "Failed to open payment window.");
      }
    },
    [internshipTitle, onSuccess, router]
  );

  /**
   * When isCheckoutActive becomes true, the Dialog is closed (open=false).
   * We wait for Radix to fully tear down, clean up body locks, then open Razorpay.
   */
  useEffect(() => {
    if (!isCheckoutActive || !pendingOrderRef.current) return;

    let cancelled = false;

    const launchCheckout = async () => {
      // Wait for Radix Dialog to fully unmount & exit animations to complete
      await new Promise((r) => setTimeout(r, 350));
      if (cancelled) return;

      // Force-clear any leftover Radix body modifications
      cleanupBodyLocks();

      // Extra frame to ensure DOM is settled
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (cancelled) return;

      const order = pendingOrderRef.current;
      if (!order) return;
      pendingOrderRef.current = null;
      openRazorpayCheckout(order);
    };

    launchCheckout();

    return () => {
      cancelled = true;
    };
  }, [isCheckoutActive, openRazorpayCheckout]);

  const handleContinue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateUrl(githubUrl)) {
      return;
    }

    setStep("LOADING");
    setLoadingText("Preparing submission...");

    // 15-second timeout fallback so UI never gets stuck on "Preparing..."
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && step === "LOADING" && !isCheckoutActive) {
        setStep("FAILED");
        toast.error("Request timed out. Please try again.");
      }
    }, 15000);

    try {
      // 1. Create Razorpay Order
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          githubUrl: githubUrl.trim(),
          comments: comments.trim() || null,
          agreeToTerms: true,
        }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from server. Please try again.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate submission process.");
      }

      // If free resubmission
      if (data.freeSubmission) {
        clearTimeout(timeoutId);
        setStep("SUCCESS");
        toast.success("Internship work resubmitted for review!");
        if (onSuccess) onSuccess();
        router.refresh();
        return;
      }

      if (!data.orderId || !data.keyId) {
        throw new Error("Payment gateway configuration error. Please check server configuration.");
      }

      // 2. Load Razorpay Script (idempotent)
      setLoadingText("Loading payment gateway...");
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || typeof window.Razorpay === "undefined") {
        throw new Error("Failed to load payment checkout SDK. Please check your internet connection.");
      }

      clearTimeout(timeoutId);

      // 3. Store order and close dialog — Razorpay opens via the effect
      pendingOrderRef.current = {
        orderId: data.orderId,
        keyId: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        userName: data.user?.name || "",
        userEmail: data.user?.email || "",
        userPhone: data.user?.phone || "",
      };

      // This triggers Dialog close → effect waits → opens Razorpay
      setIsCheckoutActive(true);
    } catch (err: any) {
      clearTimeout(timeoutId);
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

  // Dialog is open only when parent says so AND Razorpay is not active
  const dialogOpen = isOpen && !isCheckoutActive;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleModalClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (step === "LOADING") e.preventDefault();
        }}
        className="max-w-lg rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-xl"
      >
        {/* ──────── STEP: FORM ──────── */}
        {step === "FORM" && (
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                Submit Internship Work
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {internshipTitle} • Provide your GitHub repository containing all project deliverables.
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
                    Additional Comments (optional)
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

              {/* Terms & Refund Policy Consent Checkbox */}
              <div className="space-y-1 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
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
                      href="/refund-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold underline hover:text-blue-800"
                    >
                      Refund & Cancellation Policy
                    </Link>
                    . <span className="text-red-500">*</span>
                  </span>
                </label>
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
                  disabled={!agreeToTerms || !githubUrl.trim()}
                  className="rounded-xl text-xs font-bold h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
                Please wait while we connect with the verification gateway.
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
                Submission Incomplete
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your payment was not completed. Your project work has not been submitted yet.
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
                onClick={() => handleContinue()}
                className="rounded-xl text-xs font-bold h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Submission</span>
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
                ✓ Internship Work Submitted Successfully
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your project deliverables have been submitted for evaluation by the mentor team.
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
                <span>View My Submissions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
