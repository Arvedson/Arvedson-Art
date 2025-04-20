"use client"; // <-- Semicolon añadido aquí

import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation'; // <-- Importar useParams
import useOrder from '@/hooks/useOrder';
import OrderStatus from '@/app/components/OrderStatus';

export default function OrderPage() { // <-- Quitar props "params"
  const { id } = useParams<{ id: string }>(); // <-- Obtener ID desde hook
  const { order, isLoading, error } = useOrder(id);

  if (isLoading) return <p>Cargando...</p>;
  if (error || !order) return notFound();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pedido #{order.id}</h1>
      <OrderStatus status={order.orderStatus} />
    </div>
  );
}