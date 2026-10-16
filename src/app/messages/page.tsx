"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useConversationList } from "@/hooks/useConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import { TParticipant, TConversationItem } from "@/types";
import {
  MessageSquare,
  Search,
  Users,
  Loader2,
  Clock,
  X,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const targetUserName = searchParams.get("userName");
  const targetUserRole = searchParams.get("userRole");

  const { user } = useSelector((state: RootState) => state.auth);

  const { conversations, isLoading } = useConversationList();

  const [activeParticipant, setActiveParticipant] = useState<TParticipant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const handledTargetUserIdRef = useRef<string | null>(null);
  const hasAutoSelectedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/messages");
    }
  }, [user, router]);

  // Handle URL target user or initial desktop auto-selection
  useEffect(() => {
    if (targetUserId && handledTargetUserIdRef.current !== targetUserId) {
      handledTargetUserIdRef.current = targetUserId;
      const existing = conversations.find(
        (c) => c.participant.id === targetUserId
      );
      if (existing) {
        setActiveParticipant(existing.participant);
      } else {
        // Initialize synthetic participant for initiating conversation
        setActiveParticipant({
          id: targetUserId,
          fullName: targetUserName || "Producer / Partner",
          role: (targetUserRole as any) || "PRODUCER",
          isOnline: false,
        });
      }
    } else if (!handledTargetUserIdRef.current && !hasAutoSelectedRef.current && conversations.length > 0) {
      hasAutoSelectedRef.current = true;
      // Auto-select first conversation ONLY on desktop devices (width >= 768px).
      // On mobile devices, keep activeParticipant as null so the user lands on the conversation list.
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setActiveParticipant(conversations[0].participant);
      }
    }
  }, [targetUserId, targetUserName, targetUserRole, conversations]);

  // Keep desktop layout populated if resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !activeParticipant && conversations.length > 0) {
        setActiveParticipant(conversations[0].participant);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeParticipant, conversations]);

  const handleBackToConversations = () => {
    setActiveParticipant(null);
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) =>
      c.participant.fullName.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f4f7f5] overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-2 sm:mb-4 flex-shrink-0 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md flex-shrink-0">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <span className="truncate">Agricultural Direct Messaging</span>
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm text-slate-600 ${activeParticipant ? "hidden sm:block" : "block"}`}>
              Real-time negotiation, harvest inquiries, and delivery logistics coordination.
            </p>
          </div>
          {activeParticipant && (
            <button
              type="button"
              onClick={handleBackToConversations}
              className="md:hidden flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <Users className="h-4 w-4 text-emerald-600" />
              <span>All Chats</span>
            </button>
          )}
        </div>

        {/* Messaging Layout Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          {/* Conversation List Sidebar */}
          <div
            className={`md:col-span-4 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full min-h-0 overflow-hidden ${
              activeParticipant ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search Input */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 flex-shrink-0">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100/80">
              {isLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-700">No active conversations</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Start a chat from any product listing page or driver route view.
                  </p>
                </div>
              ) : (
                filteredConversations.map((item: TConversationItem) => {
                  const isSelected = activeParticipant?.id === item.participant.id;
                  return (
                    <button
                      key={item.participant.id}
                      onClick={() => setActiveParticipant(item.participant)}
                      className={`w-full text-left p-4 transition-colors flex items-start gap-3 hover:bg-slate-50 ${
                        isSelected ? "bg-emerald-50/70 border-l-4 border-emerald-600" : ""
                      }`}
                    >
                      <div className="relative h-11 w-11 rounded-full overflow-hidden bg-emerald-100 border border-emerald-200 flex-shrink-0">
                        {item.participant.profileImage ? (
                          <Image
                            src={item.participant.profileImage}
                            alt={item.participant.fullName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-sm font-bold text-emerald-800">
                            {item.participant.fullName?.charAt(0) || "U"}
                          </span>
                        )}
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                            item.participant.isOnline ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">
                            {item.participant.fullName}
                          </h4>
                          {item.lastMessage?.createdAt && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(item.lastMessage.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-slate-500 truncate">
                            {item.lastMessage?.message || "No messages yet"}
                          </p>
                          {item.unreadCount > 0 && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white flex-shrink-0">
                              {item.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Window */}
          <div
            className={`md:col-span-8 lg:col-span-8 h-full min-h-0 ${
              !activeParticipant ? "hidden md:block" : "block"
            }`}
          >
            <ChatWindow
              activeParticipant={activeParticipant}
              currentUserId={user?.id || ""}
              onBack={handleBackToConversations}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
