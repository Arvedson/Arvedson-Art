// File: src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    // Si se proporciona sessionId, buscar orden específica
    if (sessionId) {
      const order = await prisma.order.findFirst({
        where: { sessionId },
        select: {
          id: true,
          orderStatus: true,
          amountTotal: true,
          createdAt: true,
          customerInfo: true,
        },
      });

      return NextResponse.json(order ? [order] : []);
    }

    // Si no hay sessionId, devolver todas las órdenes (comportamiento original)
    const orders = await prisma.order.findMany({
      include: { events: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
