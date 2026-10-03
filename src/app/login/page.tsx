import React, { Suspense } from "react";
import { Metadata } from "next";
import { LoginForm } from "./login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Log In | CodeElevate",
  description: "Log in to your CodeElevate student or admin account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
