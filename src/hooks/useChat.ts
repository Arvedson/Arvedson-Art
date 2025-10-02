import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: "CUSTOMER" | "ARTIST" | "SYSTEM";
  type: "TEXT" | "IMAGE" | "SYSTEM";
  content?: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: any;
  sendMessage: (
    content: string,
    type?: "TEXT" | "IMAGE",
    imageUrl?: string
  ) => Promise<void>;
  markAsRead: () => Promise<void>;
  refreshMessages: () => void;
}

export default function useChat(
  orderId: string,
  sender: "CUSTOMER" | "ARTIST"
): UseChatReturn {
  const [isSending, setIsSending] = useState(false);

  // Fetch messages using SWR
  const {
    data: messages = [],
    error,
    isLoading,
    mutate,
  } = useSWR<ChatMessage[]>(
    orderId ? `/api/chat/${orderId}` : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error fetching messages");
      }
      return response.json();
    },
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: true,
    }
  );

  // Send message function
  const sendMessage = useCallback(
    async (
      content: string,
      type: "TEXT" | "IMAGE" = "TEXT",
      imageUrl?: string
    ) => {
      if (!orderId || isSending) return;

      setIsSending(true);
      try {
        const response = await fetch(`/api/chat/${orderId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender,
            type,
            content: type === "TEXT" ? content : undefined,
            imageUrl: type === "IMAGE" ? imageUrl : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error("Error sending message");
        }

        // Refresh messages after sending
        mutate();
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      } finally {
        setIsSending(false);
      }
    },
    [orderId, sender, mutate, isSending]
  );

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!orderId) return;

    try {
      await fetch(`/api/chat/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sender }),
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [orderId, sender]);

  // Refresh messages manually
  const refreshMessages = useCallback(() => {
    mutate();
  }, [mutate]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages, markAsRead]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refreshMessages,
  };
}


