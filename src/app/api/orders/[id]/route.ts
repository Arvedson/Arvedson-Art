// src/app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, OrderStatus as PrismaOrderStatus } from '@prisma/client';
import { sendOrderStatusEmail, OrderStatus } from '@/utils/orderStatusEmail';
import { CartItem, CustomerInfo, Address } from '@/types/cart';

const prisma = new PrismaClient();

// Handler GET Corregido [[1]][[3]]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Awaiting params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { events: { orderBy: { createdAt: 'asc' } } },
  });
  
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Parsear JSON fields con validación [[5]]
  const parsedOrder = {
    ...order,
    customerInfo: typeof order.customerInfo === 'string' 
      ? JSON.parse(order.customerInfo) 
      : order.customerInfo,
    shippingInfo: order.shippingInfo 
      ? typeof order.shippingInfo === 'string' 
        ? JSON.parse(order.shippingInfo)
        : order.shippingInfo
      : null
  };

  return NextResponse.json(parsedOrder);
}

// Handler PUT Corregido [[1]][[4]]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Awaiting params
  const { status, description } = await req.json();
  const validStatuses = ['PAID','PRODUCTION','SHIPPED','DELIVERED'];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  // Obtener orden con datos parseados [[6]]
  const existingOrder = await prisma.order.findUnique({
    where: { id },
    select: { 
      id: true,
      orderStatus: true,
      customerInfo: true,
      shippingInfo: true,
      items: true,
      amountTotal: true,
      events: { orderBy: { createdAt: 'asc' } }
    }
  });

  if (!existingOrder) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  // Parsear JSON fields con validación [[5]]
  const customerInfo: CustomerInfo = 
    typeof existingOrder.customerInfo === 'string'
      ? JSON.parse(existingOrder.customerInfo)
      : existingOrder.customerInfo;

  const shippingInfo: Address | null = 
    existingOrder.shippingInfo 
      ? typeof existingOrder.shippingInfo === 'string'
        ? JSON.parse(existingOrder.shippingInfo)
        : existingOrder.shippingInfo
      : null;

  // Mostrar correo en consola
  if (!customerInfo?.email) {
    console.warn(`[Orden ${id}] Email no encontrado:`, customerInfo);
  } else {
    console.log(`[Orden ${id}] Email del cliente:`, customerInfo.email);
  }

  // Actualizar estado [[7]]
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      orderStatus: status as PrismaOrderStatus,
      events: {
        create: {
          status: status as PrismaOrderStatus,
          description: description || `Estado cambiado a ${status}`,
        },
      },
    },
    select: {
      id: true,
      orderStatus: true,
      customerInfo: true,
      shippingInfo: true,
      items: true,
      amountTotal: true,
      events: { orderBy: { createdAt: 'asc' } }
    }
  });

  // Parsear datos para el correo [[5]]
  const parsedOrder = {
    ...updatedOrder,
    customerInfo: typeof updatedOrder.customerInfo === 'string' 
      ? JSON.parse(updatedOrder.customerInfo) 
      : updatedOrder.customerInfo,
    shippingInfo: updatedOrder.shippingInfo 
      ? typeof updatedOrder.shippingInfo === 'string' 
        ? JSON.parse(updatedOrder.shippingInfo)
        : updatedOrder.shippingInfo
      : null
  };

  // Enviar correo [[8]]
  await sendOrderStatusEmail(
    parsedOrder,
    status as OrderStatus,
    parsedOrder.items,
    parsedOrder.customerInfo,
    parsedOrder.shippingInfo
  );

  return NextResponse.json(parsedOrder);
}