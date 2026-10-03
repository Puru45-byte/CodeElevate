import React from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { SettingsManager } from "./settings-manager";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  await requireAdmin();
  return <SettingsManager />;
}
