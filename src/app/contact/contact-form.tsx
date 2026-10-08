"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Mail,
  User,
  Phone,
  HelpCircle,
} from "lucide-react";
import {
  contactFormSchema,
  ContactFormData,
  CONTACT_TOPICS,
} from "@/lib/validations/contact";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      topic: "Application",
      paymentIdRef: "",
      message: "",
      website_hp: "",
      consent: true,
    },
  });

  const selectedTopic = watch("topic");
  const messageValue = watch("message") || "";

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    setServerSuccess(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to submit message.");
      }

      setServerSuccess(
        json.message ||
          "Thanks, we have received your message. We usually reply within 1-2 working days."
      );
      reset({
        name: "",
        email: "",
        phone: "",
        topic: "Application",
        paymentIdRef: "",
        message: "",
        website_hp: "",
        consent: true,
      });
    } catch (err: any) {
      setServerError(
        err.message || "Something went wrong while sending your message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Direct Support Desk
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Send Us a Message
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Fill out the form below and our student support team will review your inquiry.
        </p>
      </div>

      {serverSuccess && (
        <div className="mb-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-5 text-emerald-900 flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-emerald-900">Message Sent Successfully</p>
            <p className="text-emerald-800 mt-0.5">{serverSuccess}</p>
          </div>
        </div>
      )}

      {serverError && (
        <div className="mb-6 rounded-2xl border-2 border-rose-200 bg-rose-50/80 p-5 text-rose-900 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-rose-900">Submission Error</p>
            <p className="text-rose-800 mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Honeypot field (hidden from humans) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website_hp">Leave this field empty</label>
          <input
            type="text"
            id="website_hp"
            tabIndex={-1}
            autoComplete="off"
            {...register("website_hp")}
          />
        </div>

        {/* Row: Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Your Name <span className="text-rose-500">*</span></span>
            </label>
            <Input
              placeholder="e.g. Rahul Sharma"
              {...register("name")}
              className={`text-xs ${errors.name ? "border-rose-400 focus-visible:ring-rose-200" : ""}`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>Registered Email <span className="text-rose-500">*</span></span>
            </label>
            <Input
              type="email"
              placeholder="rahul@example.com"
              {...register("email")}
              className={`text-xs ${errors.email ? "border-rose-400 focus-visible:ring-rose-200" : ""}`}
            />
            {errors.email && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Row: Phone and Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>Phone Number <span className="text-slate-400 font-normal">(Optional)</span></span>
            </label>
            <Input
              placeholder="10-digit mobile number"
              {...register("phone")}
              className={`text-xs ${errors.phone ? "border-rose-400 focus-visible:ring-rose-200" : ""}`}
            />
            {errors.phone && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
              <span>Inquiry Topic <span className="text-rose-500">*</span></span>
            </label>
            <select
              {...register("topic")}
              className={`w-full rounded-xl border bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                errors.topic ? "border-rose-400" : "border-slate-200"
              }`}
            >
              {CONTACT_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            {errors.topic && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.topic.message}</p>
            )}
          </div>
        </div>

        {/* Conditional Razorpay Payment ID Field */}
        {selectedTopic === "Payment/Refund" && (
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5 animate-in fade-in duration-200">
            <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-blue-600" />
              <span>Razorpay Payment ID / Order ID <span className="text-slate-500 font-normal">(Optional)</span></span>
            </label>
            <Input
              placeholder="e.g. pay_Nabc123456 or order_xyz"
              {...register("paymentIdRef")}
              className="text-xs bg-white border-blue-200 font-mono"
            />
            <p className="text-[10px] text-blue-700">
              Providing your Razorpay Payment ID helps us trace and reconcile bank debits faster.
            </p>
            {errors.paymentIdRef && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.paymentIdRef.message}</p>
            )}
          </div>
        )}

        {/* Message Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Your Message <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-[10px] font-medium ${
                messageValue.length > 2000
                  ? "text-rose-600 font-bold"
                  : messageValue.length < 20
                  ? "text-slate-400"
                  : "text-emerald-600"
              }`}
            >
              {messageValue.length} / 2,000 chars {messageValue.length < 20 ? "(min 20)" : ""}
            </span>
          </div>
          <textarea
            rows={5}
            placeholder="Please describe your question or issue in detail so our team can assist you effectively..."
            {...register("message")}
            className={`w-full rounded-2xl border p-3.5 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
              errors.message ? "border-rose-400 focus:ring-rose-100" : "border-slate-200"
            }`}
          />
          {errors.message && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.message.message}</p>
          )}
        </div>

        {/* Consent Checkbox */}
        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              {...register("consent")}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              I consent to the collection and processing of my contact details in accordance with CodeElevate&apos;s{" "}
              <Link href="/privacy" target="_blank" className="text-blue-600 font-semibold underline hover:text-blue-800">
                Privacy Policy
              </Link>.
            </span>
          </label>
          {errors.consent && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.consent.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Message</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
