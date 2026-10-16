"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
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
  Clock
} from "lucide-react";

function DriverMessagesContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const targetUserName = searchParams.get("userName");
  const targetUserRole = searchParams.get("userRole");

  const { user } = useSelector((state: RootState) => state.auth);

  const { conversations, isLoading } = useConversationList();

  const [activeParticipant, setActiveParticipant] = useState<TParticipant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const activeParticipantId = activeParticipant?.id;

  // Handle URL initiated conversations
  useEffect(() => {
    if (targetUserId) {
      const existing = conversations.find(
        (c) => c.participant.id === targetUserId
      );
      if (existing) {
        if (activeParticipantId !== existing.participant.id) {
          setActiveParticipant(existing.participant);
        }
      } else if (activeParticipantId !== targetUserId) {
        setActiveParticipant({
          id: targetUserId,
          fullName: targetUserName || "Producer / Customer",
          role: (targetUserRole as any) || "BUYER",
          isOnline: false,
        });
      }
    } else if (conversations.length > 0 && !activeParticipantId) {
      setActiveParticipant(conversations[0].participant);
    }
  }, [targetUserId, targetUserName, targetUserRole, conversations, activeParticipantId]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) =>
      c.participant.fullName.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </span>
            Logistics Communications
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Coordinate farm pickups with producers and delivery arrival confirmations with buyers.
          </p>
        </div>
      </div>

      {/* Messaging Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-13rem)] min-h-[560px]">
        {/* Conversation List Sidebar */}
        <div
          className={`md:col-span-4 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-0 overflow-hidden ${activeParticipant ? "hidden md:flex" : "flex"
            }`}
        >
          {/* Search Input */}
          <div className="p-4 border-b border-slate-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9.5 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-700">No active conversations</p>
                <p className="text-xs text-slate-400 mt-1">
                  Assigned delivery chats with producers and buyers will appear here.
                </p>
              </div>
            ) : (
              filteredConversations.map((item: TConversationItem) => {
                const isSelected = activeParticipant?.id === item.participant.id;
                return (
                  <button
                    key={item.participant.id}
                    onClick={() => setActiveParticipant(item.participant)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 hover:bg-slate-50 ${isSelected ? "bg-emerald-50 border-l-4 border-emerald-600" : ""
                      }`}
                  >
                    <div className="relative h-11 w-11 rounded-full overflow-hidden bg-emerald-100 border border-emerald-200 shrink-0">
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
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${item.participant.isOnline ? "bg-emerald-500" : "bg-slate-300"
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
                          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shrink-0">
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
          className={`md:col-span-8 lg:col-span-8 h-full min-h-0 ${!activeParticipant ? "hidden md:block" : "block"
            }`}
        >
          <ChatWindow
            activeParticipant={activeParticipant}
            currentUserId={user?.id || ""}
            onBack={() => setActiveParticipant(null)}
          />
        </div>
      </div>
    </div>
  );
}

export default function DriverMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <DriverMessagesContent />
    </Suspense>
  );
}
