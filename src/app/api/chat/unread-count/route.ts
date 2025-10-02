import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Obtener contador de mensajes no leídos para admin
export async function GET() {
  try {
    // Contar mensajes no leídos que no sean del artista (SYSTEM)
    const unreadCount = await prisma.message.count({
      where: {
        isRead: false,
        sender: { not: "ARTIST" },
      },
    });

    // También obtener contadores por pedido para mostrar en la lista
    const unreadByOrder = await prisma.message.groupBy({
      by: ["orderId"],
      where: {
        isRead: false,
        sender: { not: "ARTIST" },
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      totalUnread: unreadCount,
      unreadByOrder: unreadByOrder.reduce((acc, item) => {
        acc[item.orderId] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error("Error obteniendo contador de mensajes no leídos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}





