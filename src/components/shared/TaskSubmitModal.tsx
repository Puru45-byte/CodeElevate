"use client";

import React, { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { FormInput } from "@/components/shared/FormInput";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GitBranch, ShieldCheck, ArrowRight } from "lucide-react";
import { Task } from "@/types/database";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface TaskSubmitModalProps {
  task: Task;
  enrollmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TaskSubmitModal({
  task,
  enrollmentId,
  isOpen,
  onClose,
  onSuccess,
}: TaskSubmitModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [githubUrl, setGithubUrl] = useState("");
  const [githubError, setGithubError] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const router = useRouter();

  const taskNumber = task.position || task.task_number || 1;

  const validateGitHubUrl = (url: string): boolean => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+(\/)?$/i;
    return githubRegex.test(url.trim());
  };

  const handleContinueToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setGithubError("");

    if (!validateGitHubUrl(githubUrl)) {
      setGithubError("Please enter a valid GitHub repository URL (e.g. https://github.com/username/project)");
      return;
    }

    setStep(2);
  };

  const handlePayAndSubmit = async () => {
    setIsProcessingPayment(true);

    try {
      // 1. Create Razorpay order on server
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          enrollmentId,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initiate payment");
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "CodeElevate",
        description: `Project Review Fee - Task #${taskNumber}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify payment signature and create submission
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                taskId: task.id,
                enrollmentId,
                githubRepoUrl: githubUrl,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            toast.success("Task submitted successfully for review!");
            onClose();
            if (onSuccess) onSuccess();
            router.refresh();
          } catch (err: any) {
            toast.error(err.message || "Failed to verify payment");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: orderData.userName || "",
          email: orderData.userEmail || "",
        },
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      toast.error(err.message || "Error opening payment gateway");
      setIsProcessingPayment(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setGithubUrl("");
    setGithubError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? `Submit Task #${taskNumber}` : "Confirm Task Submission"}
      description={
        step === 1
          ? "Provide your public GitHub repository containing your implementation."
          : "Review details and complete submission verification."
      }
    >
      {step === 1 ? (
        <form onSubmit={handleContinueToStep2} className="space-y-4 pt-1">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-slate-700 block">{task.title}</span>
            <p className="text-xs text-slate-500">
              Ensure your repository contains clear setup steps in a README.md and required source code.
            </p>
          </div>

          <FormInput
            id="githubUrl"
            label="GitHub Repository URL"
            placeholder="https://github.com/your-username/your-repo"
            value={githubUrl}
            onChange={(e) => {
              setGithubUrl(e.target.value);
              setGithubError("");
            }}
            error={githubError}
            required
            icon={<GitBranch className="h-4 w-4" />}
            helperText="Make sure your GitHub repository is public or accessible."
          />

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
              className="rounded-xl font-semibold gap-1.5 shadow-md shadow-blue-500/20"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5 pt-1">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex justify-between items-start text-xs border-b border-slate-200/60 pb-2.5">
              <span className="text-slate-500 font-medium">Task</span>
              <span className="font-bold text-slate-900 text-right max-w-[220px] truncate">
                {task.title}
              </span>
            </div>

            <div className="flex justify-between items-start text-xs border-b border-slate-200/60 pb-2.5">
              <span className="text-slate-500 font-medium">Repository</span>
              <span className="font-mono text-blue-600 max-w-[220px] truncate text-right">
                {githubUrl}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm pt-1">
              <span className="font-bold text-slate-800">Review & Assessment Fee</span>
              <span className="text-base font-black text-slate-900">₹99</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Secured with Razorpay 256-bit encrypted checkout.</span>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isProcessingPayment}
              className="rounded-xl"
            >
              Back
            </Button>
            <Button
              onClick={handlePayAndSubmit}
              isLoading={isProcessingPayment}
              className="rounded-xl font-semibold gap-2 shadow-md shadow-blue-500/20"
            >
              <span>Pay ₹99 & Submit</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
