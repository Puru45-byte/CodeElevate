"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Notification } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, ExternalLink, MailOpen, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface NotificationsListProps {
  initialNotifications: Notification[];
}

export function NotificationsList({
  initialNotifications,
}: NotificationsListProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [isMarking, setIsMarking] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    setIsMarking(true);
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        toast.success("All notifications marked as read.");
      }
    } catch {
      toast.error("Failed to mark notifications as read.");
    } finally {
      setIsMarking(false);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black text-slate-900">Recent Updates</h2>
          {unreadCount > 0 && (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarking}
            className="rounded-xl text-xs font-bold gap-1.5 h-9"
          >
            <CheckCheck className="h-4 w-4 text-blue-600" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Bell className="h-6 w-6" />
            </div>
            <p className="text-xs text-slate-500">You have no notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.is_read && handleMarkSingleRead(item.id)}
                className={`p-5 transition-colors flex items-start gap-4 ${
                  item.is_read ? "bg-white" : "bg-blue-50/40"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    item.is_read
                      ? "bg-slate-100 text-slate-400"
                      : "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  }`}
                >
                  <Bell className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.message || (item as any).body}
                  </p>

                  {item.link && (
                    <div className="pt-1.5">
                      <Link
                        href={item.link}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                      >
                        <span>View details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
