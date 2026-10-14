import React, { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "./register-form";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";
import { isSafeRedirect } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create Account | CodeElevate",
  description: "Create your free CodeElevate student account to apply for internships and earn verified certificates.",
};

interface RegisterPageProps {
  searchParams: Promise<{ next?: string; redirect?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
        <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-2xl" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}

