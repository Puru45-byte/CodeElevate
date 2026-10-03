import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInternshipBySlug, getAllPublishedInternships } from "@/lib/queries/internships";
import { ApplyForm } from "./apply-form";
import { Profile } from "@/types/database";
import { APP_NAME } from "@/lib/constants";

export const revalidate = 0; // Dynamic route for application flow

interface ApplyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ApplyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const internship = await getInternshipBySlug(supabase, slug);

  if (!internship) {
    return { title: "Apply for Internship | CodeElevate" };
  }

  return {
    title: `Apply for ${internship.title} | ${APP_NAME}`,
    description: `Enroll in the 1-month remote practical internship for ${internship.title}. Build projects and earn verified credentials.`,
  };
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch requested internship
  const currentInternship = await getInternshipBySlug(supabase, slug);
  if (!currentInternship) {
    notFound();
  }

  // 2. Fetch all published internships for switcher
  const allInternships = await getAllPublishedInternships(supabase);

  // 3. Check if user is logged in and fetch their profile
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingProfile: Profile | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    existingProfile = profile;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 sm:py-14">
      <div className="container">
        <ApplyForm
          initialInternship={currentInternship}
          allInternships={allInternships.length > 0 ? allInternships : [currentInternship]}
          existingProfile={existingProfile}
          isLoggedIn={Boolean(user)}
        />
      </div>
    </div>
  );
}
