"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import useTheme from "../../hooks/useTheme";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  customerEmail?: string;
}

interface Order {
  id: string;
  orderStatus: string;
  amountTotal: number;
  createdAt: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  orderId,
  customerEmail,
}: PaymentSuccessModalProps) {
  const theme = useTheme();
  const isDark = theme === "dark";
  const [realOrder, setRealOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  // Buscar la orden real usando el PaymentIntent ID (orderId)
  useEffect(() => {
    if (isOpen && orderId && !realOrder) {
      setIsLoadingOrder(true);
      const findOrder = async () => {
        try {
          const response = await fetch(`/api/orders?sessionId=${orderId}`);
          if (response.ok) {
            const orders = await response.json();
            if (orders.length > 0) {
              setRealOrder(orders[0]);
            }
          }
        } catch (error) {
          console.error("Error buscando orden:", error);
        } finally {
          setIsLoadingOrder(false);
        }
      };

      // Intentar buscar la orden inmediatamente
      findOrder();

      // Si no se encuentra, reintentar cada 2 segundos hasta 10 segundos
      const interval = setInterval(() => {
        if (!realOrder) {
          findOrder();
        }
      }, 2000);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setIsLoadingOrder(false);
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isOpen, orderId, realOrder]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
              isDark
                ? "bg-gray-900 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                isDark
                  ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-3xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                ¡Pago Exitoso!
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-lg mb-8 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Tu compra ha sido procesada correctamente
              </motion.p>

              {/* Action Cards */}
              <div className="space-y-4 mb-8">
                {/* Email Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`p-4 rounded-xl border-2 border-dashed ${
                    isDark
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-green-500/30 bg-green-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <EnvelopeIcon className="w-6 h-6 text-green-500" />
                    <div className="text-left">
                      <p
                        className={`font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Revisa tu correo
                      </p>
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {customerEmail
                          ? `Enviado a ${customerEmail}`
                          : "Te hemos enviado la confirmación"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Chat Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`p-4 rounded-xl border-2 border-dashed ${
                    isDark
                      ? "border-blue-500/30 bg-blue-500/10"
                      : "border-blue-500/30 bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
                    <div className="text-left">
                      <p
                        className={`font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Abre el chat
                      </p>
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Para seguimiento y comunicación
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Order ID (if available) */}
              {realOrder && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`p-3 rounded-lg mb-6 ${
                    isDark
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-gray-100 border border-gray-200"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Número de pedido:{" "}
                    <span className="font-mono font-semibold">
                      {realOrder.id}
                    </span>
                  </p>
                </motion.div>
              )}

              {/* Loading state for order */}
              {isLoadingOrder && !realOrder && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`p-3 rounded-lg mb-6 ${
                    isDark
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-gray-100 border border-gray-200"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Obteniendo número de pedido...
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={onClose}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                    isDark
                      ? "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  Continuar comprando
                </motion.button>

                {realOrder && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    onClick={() => {
                      window.open(`/order/${realOrder.id}`, "_blank");
                      onClose();
                    }}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      isDark
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Ver pedido
                    <ArrowRightIcon className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
