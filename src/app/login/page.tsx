import React, { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";
import { isSafeRedirect } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Log In | CodeElevate",
  description: "Log in to your CodeElevate student or admin account.",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string; redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const params = await searchParams;
    const next = params.next || params.redirect;
    if (isSafeRedirect(next)) {
      redirect(next);
    }
    redirect("/dashboard");
  }

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

