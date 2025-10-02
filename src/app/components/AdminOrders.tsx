// app/admin/orders/AdminOrders.tsx
"use client";

import { useEffect, useState } from "react";
import OrderStatus from "../components/OrderStatus";
import OrderItemCard from "../components/OrderItemCard";
import ChatModal from "../components/ChatModal";
import useTheme from "../../hooks/useTheme";
import {
  ChevronDownIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

type OrderStatusType = "PAID" | "PRODUCTION" | "SHIPPED" | "DELIVERED";

interface OrderEvent {
  id: string;
  status: OrderStatusType;
  description?: string;
  createdAt: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  [key: string]: any;
}

interface Order {
  id: string;
  sessionId: string;
  items: OrderItem[];
  customerInfo: {
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  shippingInfo?: any;
  amountTotal: number;
  paymentStatus: string;
  orderStatus: OrderStatusType;
  createdAt: string;
  updatedAt: string;
  events: OrderEvent[];
}

const STEPS: OrderStatusType[] = ["PAID", "PRODUCTION", "SHIPPED", "DELIVERED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [chatOrder, setChatOrder] = useState<{
    id: string;
    customerName?: string;
  } | null>(null);
  const theme = useTheme();

  const isDark = theme === "dark";

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: Order[] = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatusType
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const updatedOrder: Order = await res.json();

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              ...updatedOrder,
              sessionId: updatedOrder.sessionId || o.sessionId,
            };
          }
          return o;
        })
      );
    } catch (err: any) {
      console.error("Error actualizando estado:", err);
      alert("No se pudo actualizar el estado. Revisa la consola.");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const openChat = (order: Order) => {
    setChatOrder({
      id: order.id,
      customerName: order.customerInfo.name || "Cliente",
    });
  };

  const closeChat = () => {
    setChatOrder(null);
  };

  const getSessionId = (order: Order): string => {
    return order.sessionId || order.id || "unknown";
  };

  const getStatusBackgroundColor = (status: string) => {
    if (status === "PAID") return isDark ? "bg-blue-300/30" : "bg-blue-100";
    if (status === "PRODUCTION")
      return isDark ? "bg-amber-300/30" : "bg-amber-100";
    if (status === "SHIPPED")
      return isDark ? "bg-indigo-300/30" : "bg-indigo-100";
    return isDark ? "bg-green-300/30" : "bg-green-100";
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div
          className={`border rounded-lg p-4 ${
            isDark
              ? "bg-red-900/10 border-red-800/30"
              : "bg-red-50 border-red-200"
          }`}
        >
          <h3
            className={`font-bold ${isDark ? "text-red-300" : "text-red-800"}`}
          >
            Error al cargar pedidos
          </h3>
          <p className={`mt-1 ${isDark ? "text-red-200" : "text-red-700"}`}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`mt-3 px-4 py-2 rounded-md text-sm border ${
              isDark
                ? "bg-red-900/20 hover:bg-red-900/30 text-red-200 border-red-700"
                : "bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
            }`}
          >
            Reintentar
          </button>
        </div>
      </div>
    );

  return (
    <div
      className={`p-4 sm:p-6 max-w-6xl mx-auto min-h-screen ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h2
          className={`text-2xl font-bold flex-1 ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Gestión de Pedidos
        </h2>
        <div
          className={`text-sm ${
            isDark ? "text-gray-300" : "text-gray-600"
          } sm:text-right w-full sm:w-auto`}
        >
          {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
        </div>
      </div>

      {orders.length === 0 ? (
        <div
          className={`rounded-xl border p-8 text-center shadow-sm ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              isDark ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-8 w-8 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h3
            className={`text-lg font-medium mt-4 ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            No hay pedidos
          </h3>
          <p className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Los nuevos pedidos aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Header - Layout mejorado con mejor uso del espacio */}
              <div
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  expandedOrder === order.id
                    ? isDark
                      ? "bg-gray-750 border-b border-gray-700"
                      : "bg-gray-50 border-b border-gray-200"
                    : isDark
                    ? "hover:bg-gray-750"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => toggleOrderExpansion(order.id)}
              >
                {/* Primera fila: Info básica + Estado + Precio */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Número de orden compacto */}
                    <div className="min-w-0">
                      <div
                        className={`font-semibold flex items-center gap-2 text-sm ${
                          isDark ? "text-gray-100" : "text-gray-900"
                        }`}
                      >
                        <span className="truncate">
                          #{getSessionId(order).slice(0, 8)}
                        </span>
                        {updatingId === order.id && (
                          <ClockIcon className="h-4 w-4 text-amber-500 animate-pulse flex-shrink-0" />
                        )}
                      </div>
                      <div
                        className={`text-xs ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {new Date(order.createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </div>

                    {/* Estado del pedido - versión compacta */}
                    <div className="hidden sm:block">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.orderStatus === "PAID"
                            ? isDark
                              ? "bg-green-600 text-white"
                              : "bg-green-500 text-white"
                            : order.orderStatus === "PRODUCTION"
                            ? isDark
                              ? "bg-yellow-600 text-white"
                              : "bg-yellow-500 text-white"
                            : order.orderStatus === "SHIPPED"
                            ? isDark
                              ? "bg-blue-600 text-white"
                              : "bg-blue-500 text-white"
                            : isDark
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        {order.orderStatus === "PAID" && "Pagado"}
                        {order.orderStatus === "PRODUCTION" && "Producción"}
                        {order.orderStatus === "SHIPPED" && "Enviado"}
                        {order.orderStatus === "DELIVERED" && "Entregado"}
                      </div>
                    </div>
                  </div>

                  {/* Precio y productos */}
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      ${order.amountTotal.toFixed(2)}
                    </div>
                    <div
                      className={`text-xs ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronDownIcon
                    className={`h-5 w-5 ml-3 flex-shrink-0 transition-transform duration-200 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    } ${expandedOrder === order.id ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Segunda fila: Estados para móvil + Cliente */}
                <div className="flex items-center justify-between">
                  {/* Estados para móvil */}
                  <div className="sm:hidden">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.orderStatus === "PAID"
                          ? isDark
                            ? "bg-green-600 text-white"
                            : "bg-green-500 text-white"
                          : order.orderStatus === "PRODUCTION"
                          ? isDark
                            ? "bg-yellow-600 text-white"
                            : "bg-yellow-500 text-white"
                          : order.orderStatus === "SHIPPED"
                          ? isDark
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDark
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {order.orderStatus === "PAID" && "Pagado"}
                      {order.orderStatus === "PRODUCTION" && "Producción"}
                      {order.orderStatus === "SHIPPED" && "Enviado"}
                      {order.orderStatus === "DELIVERED" && "Entregado"}
                    </div>
                  </div>

                  {/* Información del cliente compacta */}
                  <div className="min-w-0 flex-1 text-right">
                    <div
                      className={`text-xs truncate ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {order.customerInfo.name || "Cliente"}
                    </div>
                    <div
                      className={`text-xs truncate ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {order.customerInfo.email &&
                      order.customerInfo.email.length > 20
                        ? `${order.customerInfo.email.slice(0, 20)}...`
                        : order.customerInfo.email || "Sin email"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido expandible */}
              {expandedOrder === order.id && (
                <div
                  className={`p-4 sm:p-6 space-y-6 ${
                    isDark ? "bg-gray-850" : "bg-gray-50"
                  }`}
                >
                  {/* Productos */}
                  <div>
                    <h3
                      className={`font-medium mb-3 ${
                        isDark ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      Productos
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <OrderItemCard key={idx} item={item} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información del cliente */}
                    <div
                      className={`rounded-lg p-4 border ${
                        isDark
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <h3
                        className={`font-medium mb-3 ${
                          isDark ? "text-gray-100" : "text-gray-900"
                        }`}
                      >
                        Cliente
                      </h3>
                      <div className="space-y-2 text-sm">
                        {order.customerInfo.name && (
                          <div className="flex flex-wrap">
                            <span
                              className={`w-24 ${
                                isDark ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              Nombre:
                            </span>
                            <span
                              className={`font-medium ${
                                isDark ? "text-gray-100" : "text-gray-900"
                              }`}
                            >
                              {order.customerInfo.name}
                            </span>
                          </div>
                        )}
                        {order.customerInfo.email && (
                          <div className="flex flex-wrap">
                            <span
                              className={`w-24 ${
                                isDark ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              Email:
                            </span>
                            <span
                              className={
                                isDark ? "text-gray-100" : "text-gray-900"
                              }
                            >
                              {order.customerInfo.email}
                            </span>
                          </div>
                        )}
                        {order.customerInfo.phone && (
                          <div className="flex flex-wrap">
                            <span
                              className={`w-24 ${
                                isDark ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              Teléfono:
                            </span>
                            <span
                              className={
                                isDark ? "text-gray-100" : "text-gray-900"
                              }
                            >
                              {order.customerInfo.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Estado y total */}
                    <div
                      className={`rounded-lg p-4 border ${
                        isDark
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <h3
                        className={`font-medium mb-3 ${
                          isDark ? "text-gray-100" : "text-gray-900"
                        }`}
                      >
                        Detalles
                      </h3>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2 mt-4">
                          <div className="hidden sm:flex flex-wrap gap-1">
                            <div
                              className={`text-xs xs:text-sm px-2 py-1 rounded-full font-medium ${
                                order.orderStatus === "PAID"
                                  ? isDark
                                    ? "bg-amber-600 text-white"
                                    : "bg-amber-500 text-white"
                                  : isDark
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              Pagado
                            </div>
                            <div
                              className={`text-xs xs:text-sm px-2 py-1 rounded-full font-medium ${
                                order.orderStatus === "PRODUCTION"
                                  ? isDark
                                    ? "bg-amber-600 text-white"
                                    : "bg-amber-500 text-white"
                                  : isDark
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              En producción
                            </div>
                            <div
                              className={`text-xs xs:text-sm px-2 py-1 rounded-full font-medium ${
                                order.orderStatus === "SHIPPED"
                                  ? isDark
                                    ? "bg-amber-600 text-white"
                                    : "bg-amber-500 text-white"
                                  : isDark
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              Enviado
                            </div>
                            <div
                              className={`text-xs xs:text-sm px-2 py-1 rounded-full font-medium ${
                                order.orderStatus === "DELIVERED"
                                  ? isDark
                                    ? "bg-amber-600 text-white"
                                    : "bg-amber-500 text-white"
                                  : isDark
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              Entregado
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={order.orderStatus}
                              disabled={updatingId === order.id}
                              onChange={(e) =>
                                handleStatusChange(
                                  order.id,
                                  e.target.value as OrderStatusType
                                )
                              }
                              className={`w-full border rounded-lg p-2 text-xs xs:text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 ${
                                isDark
                                  ? "bg-gray-700 border-gray-600 text-gray-100"
                                  : "bg-white border-gray-300 text-gray-900"
                              }`}
                            >
                              {STEPS.map((step) => (
                                <option key={step} value={step}>
                                  {step === "PAID" && "Pagado"}
                                  {step === "PRODUCTION" && "En producción"}
                                  {step === "SHIPPED" && "Enviado"}
                                  {step === "DELIVERED" && "Entregado"}
                                </option>
                              ))}
                            </select>

                            {updatingId === order.id && (
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-amber-500 flex-shrink-0"></div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Selecciona para cambiar estado
                          </div>
                        </div>

                        <div
                          className={`pt-3 border-t ${
                            isDark ? "border-gray-700" : "border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between text-sm">
                            <span
                              className={
                                isDark ? "text-gray-300" : "text-gray-600"
                              }
                            >
                              Total:
                            </span>
                            <span
                              className={`font-semibold ${
                                isDark ? "text-gray-100" : "text-gray-900"
                              }`}
                            >
                              ${order.amountTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Historial de eventos */}
                  <div>
                    <h3
                      className={`font-medium mb-3 ${
                        isDark ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      Historial de Eventos
                    </h3>
                    <div
                      className={`border-l-2 pl-6 ml-4 space-y-4 ${
                        isDark ? "border-amber-600" : "border-amber-300"
                      }`}
                    >
                      {order.events.map((evt) => (
                        <div key={evt.id} className="relative pb-4">
                          <div
                            className={`absolute -left-[33px] top-2 w-4 h-4 rounded-full bg-amber-500 border-2 ${
                              isDark ? "border-gray-850" : "border-white"
                            }`}
                          ></div>
                          <div
                            className={`text-xs ${
                              isDark ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {new Date(evt.createdAt).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div
                            className={`mt-1 font-medium ${
                              isDark ? "text-gray-100" : "text-gray-900"
                            }`}
                          >
                            {evt.status === "PAID" && "Pagado"}
                            {evt.status === "PRODUCTION" && "En producción"}
                            {evt.status === "SHIPPED" && "Enviado"}
                            {evt.status === "DELIVERED" && "Entregado"}
                          </div>
                          {evt.description && (
                            <p
                              className={`mt-1 text-sm ${
                                isDark ? "text-gray-200" : "text-gray-700"
                              }`}
                            >
                              {evt.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón de Chat */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => openChat(order)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDark
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "bg-amber-500 hover:bg-amber-600 text-white"
                      }`}
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      Abrir Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {chatOrder && (
        <ChatModal
          orderId={chatOrder.id}
          customerName={chatOrder.customerName}
          isOpen={!!chatOrder}
          onClose={closeChat}
        />
      )}
    </div>
  );
}
