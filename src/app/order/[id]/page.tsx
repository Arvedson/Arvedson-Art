"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import useOrder from "@/hooks/useOrder";
import OrderStatus from "@/app/components/OrderStatus";
import ChatSection from "@/app/components/ChatSection";
import useTheme from "@/hooks/useTheme";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { order, isLoading, error } = useOrder(id);
  const theme = useTheme();
  const isDark = theme === "dark";

  // Loading state with beautiful animation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Cargando tu pedido...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-lg ${
              isDark ? "text-gray-300" : "text-gray-600"
            } mt-2`}
          >
            Un momento mientras obtenemos los detalles
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error || !order) return notFound();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case "PRODUCTION":
        return <ClockIcon className="w-6 h-6 text-yellow-500" />;
      case "SHIPPED":
        return <TruckIcon className="w-6 h-6 text-blue-500" />;
      case "DELIVERED":
        return <HomeIcon className="w-6 h-6 text-green-600" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Pago Confirmado";
      case "PRODUCTION":
        return "En Producción";
      case "SHIPPED":
        return "Enviado";
      case "DELIVERED":
        return "Entregado";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden ${
          isDark
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-[var(--primary-bg)] to-white"
        }`}
      >
        <div className="absolute inset-0 bg-[url('/textura1.jpeg')] opacity-5" />
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Pedido #{order.id}
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              {getStatusIcon(order.orderStatus)}
              <span
                className={`text-xl font-semibold ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {getStatusText(order.orderStatus)}
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Creado el {formatDate(order.createdAt)}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`p-6 rounded-2xl shadow-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`text-2xl font-bold mb-6 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Estado del Pedido
              </h2>
              <OrderStatus status={order.orderStatus} />
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`p-6 rounded-2xl shadow-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`text-2xl font-bold mb-6 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Productos
              </h2>
              {order.items && Array.isArray(order.items) ? (
                <div className="space-y-4">
                  {order.items.map((item: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`p-4 rounded-xl border ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {item.name}
                          </h3>
                          <p
                            className={`text-sm ${
                              isDark ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            Cantidad: {item.quantity} × $
                            {item.price?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          $
                          {((item.quantity || 1) * (item.price || 0)).toFixed(
                            2
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p
                  className={`text-center py-8 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No hay productos disponibles
                </p>
              )}
            </motion.div>

            {/* Chat Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <ChatSection orderId={id} />
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`p-6 rounded-2xl shadow-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Resumen del Pedido
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span
                    className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Subtotal:
                  </span>
                  <span
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ${order.amountTotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Envío:
                  </span>
                  <span
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    $50.00
                  </span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-lg font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Total:
                    </span>
                    <span className={`text-xl font-bold text-[var(--primary)]`}>
                      ${(order.amountTotal + 50)?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Customer Info */}
            {order.customerInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`p-6 rounded-2xl shadow-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3
                  className={`text-xl font-bold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  {order.customerInfo.name && (
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-[var(--primary)]" />
                      <span
                        className={`${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {order.customerInfo.name}
                      </span>
                    </div>
                  )}
                  {order.customerInfo.email && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-[var(--primary)]" />
                      <span
                        className={`${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {order.customerInfo.email}
                      </span>
                    </div>
                  )}
                  {order.customerInfo.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-[var(--primary)]" />
                      <span
                        className={`${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {order.customerInfo.phone}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Shipping Info */}
            {order.shippingInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={`p-6 rounded-2xl shadow-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3
                  className={`text-xl font-bold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Dirección de Envío
                </h3>
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-[var(--primary)] mt-1" />
                  <span
                    className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {order.shippingInfo.formattedAddress ||
                      "Dirección no especificada"}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
