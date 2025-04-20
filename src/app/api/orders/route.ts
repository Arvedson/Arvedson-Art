// File: src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  // Fetch all orders with related events, ordered by creation time
  const orders = await prisma.order.findMany({
    include: { events: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}