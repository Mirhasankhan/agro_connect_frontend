"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  RefreshCw,
  Inbox,
  X,
} from "lucide-react";
import {
  useGetUserNotificationsQuery,
  useGetUnreadNotificationCountQuery,
} from "@/redux/features/notification/notificationApi";
import { TNotification } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface NotificationDropdownProps {
  buttonClassName?: string;
  badgeClassName?: string;
}

export default function NotificationDropdown({
  buttonClassName,
  badgeClassName,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Unread count query (polls every 30 seconds for real-time feel)
  const { data: unreadData, refetch: refetchCount } =
    useGetUnreadNotificationCountQuery(undefined, {
      pollingInterval: 30000,
    });

  const unreadCount = unreadData?.data?.unreadCount || 0;

  // Notifications query - fetched when opened
  const {
    data: notificationsData,
    isLoading,
    isFetching,
    refetch: refetchNotifications,
  } = useGetUserNotificationsQuery(
    { limit: 20 },
    {
      skip: !isOpen,
    }
  );

  const notifications = notificationsData?.data?.notifications || [];

  // When opening dropdown, fetch/refetch notifications and refresh unread count
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      refetchNotifications();
      refetchCount();
    }
  };

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Icon Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        title="Notifications"
        className={
          buttonClassName ||
          "relative p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        }
      >
        <Bell className="w-5 h-5 transition-transform group-hover:scale-105" />
        {unreadCount > 0 && (
          <span
            className={
              badgeClassName ||
              "absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center shadow-sm ring-2 ring-white animate-in zoom-in-50"
            }
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-[340px] sm:w-[400px] max-h-[85vh] flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          role="dialog"
          aria-label="Notifications Dropdown"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Notifications
                </h3>
                <p className="text-[11px] text-slate-500">
                  {notifications.length > 0
                    ? `${notifications.length} update${notifications.length > 1 ? "s" : ""}`
                    : "No updates"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  refetchNotifications();
                  refetchCount();
                }}
                disabled={isFetching}
                title="Refresh"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-emerald-600" : ""}`}
                />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[400px]">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-semibold text-slate-700">
                  No notifications yet
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                  Activity updates regarding your orders, deliveries, and profile will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item: TNotification) => (
                <div
                  key={item.id}
                  className="p-3.5 transition-colors cursor-default hover:bg-slate-50/80 bg-white"
                >
                  <div className="flex items-start gap-3">
                    {/* Left Icon */}
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>

                    {/* Content Details - Type is omitted per user request */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-slate-900 leading-snug truncate">
                          {item.title}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed break-words">
                        {item.content}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-400">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Note */}
          <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-center shrink-0">
            <span className="text-[10px] text-slate-400 font-medium">
              AgroConnect Secure Notification Hub
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
