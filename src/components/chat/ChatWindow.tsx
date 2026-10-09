"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Send, Check, CheckCheck, Loader2, ArrowLeft, MessageSquare, ShieldCheck } from "lucide-react";
import { getSocket, getAuthToken } from "@/lib/socket";
import { TChatMessage, TParticipant, TConversationHistory } from "@/types";
import { toast } from "sonner";

interface ChatWindowProps {
  activeParticipant: TParticipant | null;
  currentUserId: string;
  onBack?: () => void;
}

export default function ChatWindow({
  activeParticipant,
  currentUserId,
  onBack,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!activeParticipant?.id) {
      setMessages([]);
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    const socket = getSocket();

    const doSubscribe = () => {
      const token = getAuthToken();
      socket.emit("subscribe", {
        userId: activeParticipant.id,
        token,
      });
    };

    const handleConnect = () => {
      setIsConnected(true);
      doSubscribe();
    };

    const handleAuthenticated = () => {
      setIsConnected(true);
      doSubscribe();
    };

    const handleConnectError = (err: any) => {
      setIsConnected(false);
      setIsLoadingHistory(false);
      console.warn("Socket connection error:", err?.message || err);
    };

    const handleConversationHistory = (data: TConversationHistory) => {
      setIsLoadingHistory(false);
      if (Array.isArray(data?.messages)) {
        setMessages(data.messages);
      }
    };

    const handleNewMessage = (msg: TChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      setIsSending(false);
    };

    const handleError = (err: { message?: string }) => {
      setIsLoadingHistory(false);
      setIsSending(false);
      toast.error(err?.message || "Failed to process chat action");
    };

    // Attach listeners before connecting / subscribing
    socket.on("connect", handleConnect);
    socket.on("authenticated", handleAuthenticated);
    socket.on("connect_error", handleConnectError);
    socket.on("conversationHistory", handleConversationHistory);
    socket.on("message", handleNewMessage);
    socket.on("error", handleError);

    if (socket.connected) {
      setIsConnected(true);
      doSubscribe();
    } else {
      socket.connect();
    }

    // Safety timeout to ensure spinner doesn't hang indefinitely
    const safetyTimer = setTimeout(() => {
      setIsLoadingHistory(false);
    }, 10000);

    return () => {
      clearTimeout(safetyTimer);
      socket.off("connect", handleConnect);
      socket.off("authenticated", handleAuthenticated);
      socket.off("connect_error", handleConnectError);
      socket.off("conversationHistory", handleConversationHistory);
      socket.off("message", handleNewMessage);
      socket.off("error", handleError);
    };
  }, [activeParticipant?.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeParticipant) return;

    const socket = getSocket();
    if (!socket.connected) {
      toast.error("Connecting to chat server, please retry in a second...");
      socket.connect();
      return;
    }

    setIsSending(true);
    const messageText = inputValue.trim();
    setInputValue("");

    const token = getAuthToken();
    socket.emit("sendMessage", {
      receiverId: activeParticipant.id,
      message: messageText,
      token,
    });
  };

  if (!activeParticipant) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center bg-white p-8 text-center rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 shadow-sm">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Direct Agricultural Messaging</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Select a conversation from the left to start negotiating harvest prices, coordinate hub dispatches, or manage delivery logistics.
        </p>
        <div className="mt-6 flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-600">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          End-to-end escrow protected communication
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="relative h-11 w-11 rounded-full overflow-hidden bg-emerald-100 border border-emerald-200 flex-shrink-0">
            {activeParticipant.profileImage ? (
              <Image
                src={activeParticipant.profileImage}
                alt={activeParticipant.fullName}
                fill
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-base font-bold text-emerald-800">
                {activeParticipant.fullName?.charAt(0) || "U"}
              </span>
            )}
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                activeParticipant.isOnline ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 leading-tight">
                {activeParticipant.fullName}
              </h3>
              {activeParticipant.role && (
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 tracking-wider">
                  {activeParticipant.role}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  activeParticipant.isOnline ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {activeParticipant.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
            }`}
          />
          {isConnected ? "Connected" : "Connecting..."}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#f8faf9]">
        {isLoadingHistory ? (
          <div className="flex h-full min-h-[300px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
            <span className="ml-2 text-sm text-slate-500">Loading conversation history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-500">No messages exchanged yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Send a greeting or ask a question regarding the harvest, unit pricing, or logistics.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine =
              msg.isSendByMe ||
              (Boolean(currentUserId) && msg.senderId === currentUserId);
            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                    isMine
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
                <div className="mt-1 flex items-center gap-1.5 px-1 text-[11px] text-slate-400">
                  {msg.createdAt && (
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  {isMine && (
                    <span>
                      {msg.isRead ? (
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-600 inline" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-slate-400 inline" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={handleSendMessage}
        className="flex-shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4 flex items-center gap-3"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Message ${activeParticipant.fullName}...`}
          className="form-input flex-1 py-2.5 text-sm focus:ring-emerald-500"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isSending || !isConnected}
          className="btn-primary py-2.5 px-4 flex items-center gap-1.5 disabled:opacity-50 text-sm font-semibold rounded-xl flex-shrink-0"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
