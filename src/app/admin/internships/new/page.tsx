import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { CreateInternshipForm } from "./create-internship-form";

export const revalidate = 0;

export default async function NewInternshipPage() {
  await requireAdmin();
  return <CreateInternshipForm />;
}
