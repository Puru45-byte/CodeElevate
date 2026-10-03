"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  Download,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  IndianRupee,
  Calendar,
  User,
  CreditCard,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Payment } from "@/types/database";

interface PaymentItem extends Payment {
  profile?: {
    id: string;
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  task?: {
    id: string;
    title: string;
  };
  enrollment?: {
    id: string;
    internship?: {
      title: string;
    };
  };
}

interface PaymentsManagerProps {
  initialPayments: PaymentItem[];
}

export function PaymentsManager({ initialPayments }: PaymentsManagerProps) {
  const [payments, setPayments] = useState<PaymentItem[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredPayments = payments.filter((item) => {
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;

    const studentName = `${item.profile?.first_name || ""} ${
      item.profile?.last_name || ""
    }`.toLowerCase();
    const studentEmail = (item.profile?.email || "").toLowerCase();
    const studentCode = (item.profile?.student_id || "").toLowerCase();
    const orderId = (item.razorpay_order_id || "").toLowerCase();
    const paymentId = (item.razorpay_payment_id || "").toLowerCase();
    const taskTitle = (item.task?.title || "").toLowerCase();

    const q = search.toLowerCase();
    const matchesSearch =
      studentName.includes(q) ||
      studentEmail.includes(q) ||
      studentCode.includes(q) ||
      orderId.includes(q) ||
      paymentId.includes(q) ||
      taskTitle.includes(q);

    return matchesStatus && matchesSearch;
  });

  const totalRevenuePaise = payments
    .filter((p) => p.status === "PAID")
    .reduce((acc, curr) => acc + (curr.amount_paise || 9900), 0);
  const totalRevenueRupees = Math.round(totalRevenuePaise / 100);

  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      toast.error("No payments to export.");
      return;
    }

    const headers = [
      "Order ID",
      "Payment ID",
      "Student ID",
      "Student Name",
      "Student Email",
      "Task Title",
      "Course Track",
      "Amount (INR)",
      "Status",
      "Date",
    ];

    const rows = filteredPayments.map((p) => [
      p.razorpay_order_id || "",
      p.razorpay_payment_id || "",
      p.profile?.student_id || "",
      `"${p.profile?.first_name || ""} ${p.profile?.last_name || ""}"`,
      p.profile?.email || "",
      `"${p.task?.title || ""}"`,
      `"${p.enrollment?.internship?.title || ""}"`,
      ((p.amount_paise || 9900) / 100).toFixed(2),
      p.status,
      new Date(p.created_at).toISOString().split("T")[0],
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `codeelevate_payments_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Payments CSV exported!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Payments Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track evaluation fee transactions, Razorpay gateway logs, and export
            financial records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="rounded-xl border-slate-200 font-bold text-slate-700 text-xs gap-1.5 shadow-sm hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              ₹{totalRevenueRupees.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
            ₹
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Paid Transactions
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {payments.filter((p) => p.status === "PAID").length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Fee per Evaluation
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">₹99</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search Order ID, Payment ID, Student Name, CE-ID, Task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "PAID", "CREATED", "FAILED", "REFUNDED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Order / Payment ID</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Task & Track</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const studentName = `${p.profile?.first_name || ""} ${
                    p.profile?.last_name || ""
                  }`.trim() || p.profile?.email?.split("@")[0] || "Student";

                  const amount = (p.amount_paise || 9900) / 100;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-mono text-xs font-bold text-slate-900">
                          {p.razorpay_order_id}
                        </p>
                        {p.razorpay_payment_id && (
                          <p className="font-mono text-[10px] text-blue-600">
                            {p.razorpay_payment_id}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/students/${p.user_id}`}
                          className="font-bold text-slate-800 hover:text-blue-600 hover:underline block"
                        >
                          {studentName}
                        </Link>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {p.profile?.student_id || p.profile?.email}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 max-w-xs truncate">
                          {p.task?.title || "Milestone Task"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {p.enrollment?.internship?.title || "Internship Track"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        ₹{amount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          className={`text-[10px] font-bold py-0.5 px-2 ${
                            p.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : p.status === "CREATED" || p.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {p.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
