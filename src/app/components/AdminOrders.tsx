
'use client';

import { useEffect, useState } from 'react';
import OrderStatus from '../components/OrderStatus';

type OrderStatusType = 'PAID' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED';


interface OrderEvent {
  id: string;
  status: OrderStatusType;
  description?: string;
  createdAt: string;
}

interface Order {
  id: string;
  sessionId: string;
  items: any;           // Ajusta al shape real de tus items
  customerInfo: {
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
    
  };
  shippingInfo?: any;   // Ajusta según tu modelo
  amountTotal: number;
  paymentStatus: string;
  orderStatus: OrderStatusType;
  createdAt: string;
  updatedAt: string;
  events: OrderEvent[];
  
}

const STEPS: OrderStatusType[] = ['PAID', 'PRODUCTION', 'SHIPPED', 'DELIVERED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Carga inicial de pedidos
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
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

  // Handler para cambiar estado
  const handleStatusChange = async (orderId: string, newStatus: OrderStatusType) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const updatedOrder: Order = await res.json();
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? updatedOrder : o))
      );
    } catch (err: any) {
      console.error('Error actualizando estado:', err);
      alert('No se pudo actualizar el estado. Revisa la consola.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p>Cargando pedidos...</p>;
  if (error)   return <p className="text-red-600">Error al cargar pedidos: {error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Listado de Pedidos</h2>

      {orders.length === 0 ? (
        <p>No hay pedidos disponibles.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map(order => (
            <li key={order.id} className="border rounded-lg shadow-sm p-4">
              {/* Encabezado: ID y Fecha */}
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">ID Pedido:</span>
                <span className="text-gray-500 text-sm">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Cliente y Total */}
              <div className="mb-2">
                <span className="font-medium">Cliente:</span>{' '}
                {order.customerInfo.name || order.customerInfo.email || '—'}
              </div>
              <div className="mb-2">
                <span className="font-medium">Total:</span>{' '}
                ${order.amountTotal.toFixed(2)}
              </div>

              {/* Selector para cambiar estado */}
              <div className="mb-2 flex items-center space-x-2">
                <label htmlFor={`status-${order.id}`} className="font-medium">
                  Cambiar Estado:
                </label>
                <select
                  id={`status-${order.id}`}
                  value={order.orderStatus}
                  disabled={updatingId === order.id}
                  onChange={e =>
                    handleStatusChange(order.id, e.target.value as OrderStatusType)
                  }
                  className="border rounded p-1"
                >
                  {STEPS.map(step => (
                    <option key={step} value={step}>
                      {step}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado actual con tu componente visual */}
              <div className="mb-2">
                <span className="font-medium">Estado Actual:</span>{' '}
                <OrderStatus status={order.orderStatus} />
              </div>

              {/* Historial de eventos */}
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-600">
                  Historial de Eventos ({order.events.length})
                </summary>
                <ul className="mt-2 space-y-1">
                  {order.events.map(evt => (
                    <li key={evt.id} className="text-sm">
                      <span className="font-medium">{evt.status}:</span>{' '}
                      {evt.description || '—'}{' '}
                      <span className="text-gray-400">
                        ({new Date(evt.createdAt).toLocaleString()})
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
