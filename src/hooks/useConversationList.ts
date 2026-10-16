"use client";

import { useState, useEffect, useCallback } from "react";
import { getSocket, getAuthToken } from "@/lib/socket";
import { TConversationItem, TChatMessage } from "@/types";

export const useConversationList = () => {
  const [conversations, setConversations] = useState<TConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const requestConversations = useCallback(() => {
    const socket = getSocket();
    const token = getAuthToken();
    if (socket.connected) {
      socket.emit("conversationList", { token });
      socket.emit("conversatinList", { token });
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleConversationList = (data: unknown) => {
      let list: TConversationItem[] = [];
      if (Array.isArray(data)) {
        list = data as TConversationItem[];
      } else if (
        data &&
        typeof data === "object" &&
        "data" in data &&
        Array.isArray((data as { data: unknown }).data)
      ) {
        list = (data as { data: TConversationItem[] }).data;
      }
      setConversations(list);
      setIsLoading(false);
    };

    const handleConnect = () => {
      const token = getAuthToken();
      socket.emit("conversationList", { token });
      socket.emit("conversatinList", { token });
    };

    const handleAuthenticated = () => {
      const token = getAuthToken();
      socket.emit("conversationList", { token });
      socket.emit("conversatinList", { token });
    };

    // When an incoming message arrives, update the matching conversation's last message immediately
    const handleMessage = (msg: TChatMessage) => {
      if (!msg) return;

      setConversations((prev) => {
        const otherId = msg.isSendByMe ? msg.receiverId : msg.senderId;
        const index = prev.findIndex(
          (c) => c.participant.id === otherId || c.participant.id === msg.senderId
        );

        const newLastMessage = {
          message: msg.message,
          images: msg.images,
          createdAt: msg.createdAt || new Date().toISOString(),
        };

        if (index !== -1) {
          const updatedItem: TConversationItem = {
            ...prev[index],
            lastMessage: newLastMessage,
            unreadCount: msg.isSendByMe
              ? prev[index].unreadCount
              : prev[index].unreadCount + (msg.isRead ? 0 : 1),
          };
          const next = [...prev];
          next.splice(index, 1);
          return [updatedItem, ...next];
        }

        // If conversation is not found in local list, request fresh conversationList from socket
        requestConversations();
        return prev;
      });
    };

    socket.on("conversationList", handleConversationList);
    socket.on("conversatinList", handleConversationList);
    socket.on("connect", handleConnect);
    socket.on("authenticated", handleAuthenticated);
    socket.on("message", handleMessage);

    // If socket is already connected, trigger request immediately
    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    // Safety timeout to ensure loading state resolves
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => {
      clearTimeout(safetyTimer);
      socket.off("conversationList", handleConversationList);
      socket.off("conversatinList", handleConversationList);
      socket.off("connect", handleConnect);
      socket.off("authenticated", handleAuthenticated);
      socket.off("message", handleMessage);
    };
  }, [requestConversations]);

  return {
    conversations,
    isLoading,
    refetch: requestConversations,
    setConversations,
  };
};
