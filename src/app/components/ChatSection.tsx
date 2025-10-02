"use client";

import { useState, useRef, useEffect } from "react";
import {
  PaperAirplaneIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import useChat from "@/hooks/useChat";
import useTheme from "@/hooks/useTheme";

interface ChatSectionProps {
  orderId: string;
}

export default function ChatSection({ orderId }: ChatSectionProps) {
  const [message, setMessage] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isDark = theme === "dark";

  const { messages, isLoading, sendMessage } = useChat(orderId, "CUSTOMER");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isImageUploading) return;

    try {
      await sendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error enviando mensaje");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida");
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert("La imagen debe ser menor a 20MB");
      return;
    }

    setIsImageUploading(true);
    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload image (you'll need to implement this endpoint)
      const uploadResponse = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Error uploading image");
      }

      const { imageUrl } = await uploadResponse.json();
      await sendMessage("", "IMAGE", imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error subiendo imagen");
    } finally {
      setIsImageUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = messages.filter(
    (msg) => msg.sender !== "CUSTOMER" && !msg.isRead
  ).length;

  return (
    <div
      className={`border rounded-lg ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 text-left flex items-center justify-between transition-colors ${
          isDark ? "hover:bg-gray-750" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <ChatBubbleLeftRightIcon
            className={`h-5 w-5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
          />
          <div>
            <h3
              className={`font-medium ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Chat con el artista
            </h3>
            <p
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {unreadCount > 0
                ? `${unreadCount} mensaje${unreadCount > 1 ? "s" : ""} nuevo${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "Envía un mensaje sobre tu pedido"}
            </p>
          </div>
        </div>
        <div
          className={`transform transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Messages */}
      {isExpanded && (
        <div
          className={`border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div
            className={`h-64 overflow-y-auto p-4 space-y-4 ${
              isDark ? "bg-gray-900" : "bg-gray-50"
            }`}
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div
                className={`text-center py-8 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay mensajes aún.</p>
                <p className="text-sm mt-1">
                  ¡Envía un mensaje para iniciar la conversación!
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isCustomer = msg.sender === "CUSTOMER";
                const isSystem = msg.sender === "SYSTEM";

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isCustomer ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        isSystem
                          ? `text-center text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`
                          : isCustomer
                          ? `${
                              isDark
                                ? "bg-amber-600 text-white"
                                : "bg-amber-500 text-white"
                            }`
                          : `${
                              isDark
                                ? "bg-gray-700 text-gray-100"
                                : "bg-gray-200 text-gray-900"
                            }`
                      }`}
                    >
                      {msg.type === "IMAGE" && msg.imageUrl ? (
                        <img
                          src={msg.imageUrl}
                          alt="Imagen del chat"
                          className="max-w-full h-auto rounded"
                        />
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          isSystem
                            ? isDark
                              ? "text-gray-500"
                              : "text-gray-500"
                            : isCustomer
                            ? "text-amber-100"
                            : isDark
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className={`p-4 border-t ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImageUploading}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-500"
                } ${isImageUploading ? "opacity-50" : ""}`}
              >
                <PhotoIcon className="h-5 w-5" />
              </button>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={isImageUploading}
                className={`flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${isImageUploading ? "opacity-50" : ""}`}
              />

              <button
                type="submit"
                disabled={!message.trim() || isImageUploading}
                className={`p-2 rounded-lg transition-colors ${
                  message.trim() && !isImageUploading
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : isDark
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
