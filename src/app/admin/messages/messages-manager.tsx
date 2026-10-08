"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  CreditCard,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

export interface ContactMessageItem {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  topic: string;
  message: string;
  payment_id_ref: string | null;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  admin_notes: string | null;
  ip_hash: string | null;
  created_at: string;
  updated_at: string;
}

interface MessagesManagerProps {
  initialMessages: ContactMessageItem[];
}

export function MessagesManager({ initialMessages }: MessagesManagerProps) {
  const [messages, setMessages] = useState<ContactMessageItem[]>(initialMessages);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [topicFilter, setTopicFilter] = useState<string>("ALL");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Stats calculation
  const totalCount = messages.length;
  const newCount = messages.filter((m) => m.status === "NEW").length;
  const inProgressCount = messages.filter((m) => m.status === "IN_PROGRESS").length;
  const resolvedCount = messages.filter((m) => m.status === "RESOLVED").length;

  const filteredMessages = messages.filter((m) => {
    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    const matchesTopic = topicFilter === "ALL" || m.topic === topicFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(searchLower) ||
      m.email.toLowerCase().includes(searchLower) ||
      (m.phone && m.phone.includes(searchLower)) ||
      (m.payment_id_ref && m.payment_id_ref.toLowerCase().includes(searchLower)) ||
      m.topic.toLowerCase().includes(searchLower) ||
      m.message.toLowerCase().includes(searchLower);

    return matchesStatus && matchesTopic && matchesSearch;
  });

  const handleOpenDetail = (msg: ContactMessageItem) => {
    setSelectedMessage(msg);
    setAdminNotes(msg.admin_notes || "");
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: "NEW" | "IN_PROGRESS" | "RESOLVED",
    notesToSave?: string
  ) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: notesToSave !== undefined ? notesToSave : adminNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update status");
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status: newStatus,
                admin_notes: notesToSave !== undefined ? notesToSave : adminNotes,
                updated_at: new Date().toISOString(),
              }
            : m
        )
      );

      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({
          ...selectedMessage,
          status: newStatus,
          admin_notes: notesToSave !== undefined ? notesToSave : adminNotes,
        });
      }

      toast.success(`Message marked as ${newStatus.replace("_", " ")}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/messages/${selectedMessage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_notes: adminNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save notes");
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id ? { ...m, admin_notes: adminNotes } : m
        )
      );

      toast.success("Admin notes saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save notes");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 text-xs">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            NEW
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 text-xs">
            <Clock className="w-3 h-3 text-blue-600" />
            IN PROGRESS
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-xs">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            RESOLVED
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Inquiries
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              New Messages
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2">{newCount}</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
              In Progress
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-900 mt-2">{inProgressCount}</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Resolved
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-900 mt-2">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, topic, payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="h-3.5 w-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses ({totalCount})</option>
            <option value="NEW">New ({newCount})</option>
            <option value="IN_PROGRESS">In Progress ({inProgressCount})</option>
            <option value="RESOLVED">Resolved ({resolvedCount})</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-2">
            <span>Topic:</span>
          </div>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Topics</option>
            <option value="Application">Application</option>
            <option value="Payment/Refund">Payment/Refund</option>
            <option value="Certificate">Certificate</option>
            <option value="Technical issue">Technical issue</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No contact messages found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== "ALL" || topicFilter !== "ALL"
                ? "Try adjusting your search query or filters."
                : "No customer inquiries have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700">
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold">Topic</th>
                  <th className="p-3.5 font-bold">Sender</th>
                  <th className="p-3.5 font-bold">Message Preview</th>
                  <th className="p-3.5 font-bold">Date Received</th>
                  <th className="p-3.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => handleOpenDetail(msg)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 whitespace-nowrap">
                      {getStatusBadge(msg.status)}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-100 text-slate-800">
                        {msg.topic}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{msg.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{msg.email}</span>
                      </div>
                      {msg.phone && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{msg.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 max-w-xs sm:max-w-md">
                      <p className="line-clamp-2 text-slate-700">
                        {msg.message}
                      </p>
                      {msg.payment_id_ref && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-600 font-mono">
                          <CreditCard className="h-3 w-3" />
                          <span>Ref: {msg.payment_id_ref}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-500">
                      {format(new Date(msg.created_at), "dd MMM yyyy, hh:mm a")}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {msg.status !== "RESOLVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800"
                            onClick={() => handleUpdateStatus(msg.id, "RESOLVED")}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-slate-500 hover:text-slate-900"
                          onClick={() => handleOpenDetail(msg)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Details Modal / Drawer */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Inquiry Details
                  </span>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {selectedMessage.topic} Inquiry
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Sender Name</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Email Address</p>
                  <p className="font-bold text-blue-600 mt-0.5">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: CodeElevate Support Inquiry - ${selectedMessage.topic}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      {selectedMessage.email}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Phone Number</p>
                    <p className="font-bold text-slate-800 mt-0.5">
                      <a href={`tel:${selectedMessage.phone}`} className="hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Received At</p>
                  <p className="text-slate-700 mt-0.5">
                    {format(new Date(selectedMessage.created_at), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
                {selectedMessage.payment_id_ref && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">
                      Razorpay Payment Reference
                    </p>
                    <p className="font-mono font-bold text-blue-700 mt-0.5">
                      {selectedMessage.payment_id_ref}
                    </p>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div>
                <p className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
                  Full Message
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Internal Admin Notes
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating}
                    onClick={handleSaveNotes}
                    className="h-7 text-xs"
                  >
                    Save Notes
                  </Button>
                </div>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about the resolution or communication with the student..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Update Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Update Resolution Status
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={isUpdating || selectedMessage.status === "NEW"}
                    onClick={() => handleUpdateStatus(selectedMessage.id, "NEW")}
                    className={`text-xs ${
                      selectedMessage.status === "NEW"
                        ? "bg-amber-600 text-white"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                    }`}
                  >
                    Set to NEW
                  </Button>
                  <Button
                    size="sm"
                    disabled={isUpdating || selectedMessage.status === "IN_PROGRESS"}
                    onClick={() => handleUpdateStatus(selectedMessage.id, "IN_PROGRESS")}
                    className={`text-xs ${
                      selectedMessage.status === "IN_PROGRESS"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                    }`}
                  >
                    Set to IN PROGRESS
                  </Button>
                  <Button
                    size="sm"
                    disabled={isUpdating || selectedMessage.status === "RESOLVED"}
                    onClick={() => handleUpdateStatus(selectedMessage.id, "RESOLVED")}
                    className={`text-xs ${
                      selectedMessage.status === "RESOLVED"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    Set to RESOLVED
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: CodeElevate Support Inquiry - ${selectedMessage.topic}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                <Mail className="h-4 w-4" />
                Reply via Email
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMessage(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
