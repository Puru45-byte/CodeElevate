import React from "react";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { MessagesManager } from "./messages-manager";

export const metadata: Metadata = {
  title: "Support Inquiries & Grievances | Admin | CodeElevate",
  description: "View and manage incoming customer inquiries, payment dispute references, and grievance tickets.",
};

export const revalidate = 0;

export default async function AdminMessagesPage() {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: messages } = await supabaseAdmin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Customer Support
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Inquiries & Grievances
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review incoming messages from students, verify payment transaction inquiries, and maintain statutory grievance resolution records.
        </p>
      </div>

      <MessagesManager initialMessages={messages || []} />
    </div>
  );
}
