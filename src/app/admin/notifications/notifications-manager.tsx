"use client";

import React, { useState } from "react";
import {
  Bell,
  Sparkles,
  Send,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  link?: string | null;
  read: boolean;
  created_at: string;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
    student_id: string;
  };
}

interface NotificationsManagerProps {
  initialNotifications: NotificationItem[];
}

export function NotificationsManager({
  initialNotifications,
}: NotificationsManagerProps) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      toast.error("Title and message are required.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          body: broadcastBody,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Broadcast failed");

      toast.success(
        `Broadcast sent to ${data.count || "all"} active students!`
      );
      setBroadcastTitle("");
      setBroadcastBody("");
    } catch (err: any) {
      toast.error(err.message || "Failed to broadcast notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Notification Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Send platform-wide broadcast announcements and inspect automated
            student activity alerts.
          </p>
        </div>

        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold px-3 py-1 text-xs">
          {notifications.length} System Logs
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Broadcast form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span>Send Broadcast</span>
          </h2>
          <p className="text-xs text-slate-500">
            Publish an in-app alert to all enrolled students dashboard bell.
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Announcement Title
              </label>
              <Input
                placeholder="e.g. Mentor AMA Live Session Tomorrow"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Notification Message
              </label>
              <Textarea
                rows={4}
                placeholder="Details of announcement..."
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 rounded-xl text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? "Sending..." : "Publish Broadcast"}
            </Button>
          </form>
        </div>

        {/* Right: Notification stream */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span>Recent System Notifications</span>
          </h2>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">
                No notification events recorded yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-extrabold text-slate-900">{n.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{n.body}</p>
                  {n.profile && (
                    <p className="text-[10px] text-blue-600 font-semibold pt-1">
                      Recipient: {n.profile.first_name} {n.profile.last_name} (
                      {n.profile.student_id})
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
