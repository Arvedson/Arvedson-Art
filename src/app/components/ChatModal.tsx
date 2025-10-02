"use client";

import { useState, useRef, useEffect } from "react";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import useChat from "@/hooks/useChat";
import useTheme from "@/hooks/useTheme";

interface ChatModalProps {
  orderId: string;
  customerName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({
  orderId,
  customerName,
  isOpen,
  onClose,
}: ChatModalProps) {
  const [message, setMessage] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isDark = theme === "dark";

  const { messages, isLoading, sendMessage } = useChat(orderId, "ARTIST");

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        <div
          className={`relative w-full max-w-2xl rounded-lg shadow-xl ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div>
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Chat con {customerName || "Cliente"}
              </h3>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Pedido #{orderId.slice(0, 8)}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-100 text-gray-500"
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            className={`h-96 overflow-y-auto p-4 space-y-4 ${
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
                No hay mensajes aún. ¡Inicia la conversación!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isArtist = msg.sender === "ARTIST";
                const isSystem = msg.sender === "SYSTEM";
                const showDate =
                  index === 0 ||
                  new Date(msg.createdAt).toDateString() !==
                    new Date(messages[index - 1].createdAt).toDateString();

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div
                        className={`text-center text-xs py-2 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {formatDate(msg.createdAt)}
                      </div>
                    )}

                    <div
                      className={`flex ${
                        isArtist ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          isSystem
                            ? `text-center text-sm ${
                                isDark ? "text-gray-400" : "text-gray-600"
                              }`
                            : isArtist
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
                              : isArtist
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
      </div>
    </div>
  );
}
