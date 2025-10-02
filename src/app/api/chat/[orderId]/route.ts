import { NextResponse } from "next/server";
import { PrismaClient, MessageSender, MessageType } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Obtener mensajes de un pedido
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Verificar que el pedido existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Obtener mensajes ordenados por fecha de creación
    const messages = await prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error obteniendo mensajes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Enviar mensaje
export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { sender, type, content, imageUrl } = await req.json();

    // Validar datos requeridos
    if (!sender || !type) {
      return NextResponse.json(
        { error: "Sender y type son requeridos" },
        { status: 400 }
      );
    }

    if (type === "TEXT" && !content) {
      return NextResponse.json(
        { error: "Content es requerido para mensajes de texto" },
        { status: 400 }
      );
    }

    if (type === "IMAGE" && !imageUrl) {
      return NextResponse.json(
        { error: "ImageUrl es requerido para mensajes de imagen" },
        { status: 400 }
      );
    }

    // Verificar que el pedido existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Crear mensaje
    const message = await prisma.message.create({
      data: {
        orderId,
        sender: sender as MessageSender,
        type: type as MessageType,
        content: content || null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Marcar mensajes como leídos
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { sender } = await req.json();

    // Marcar como leídos todos los mensajes del pedido que no sean del remitente actual
    await prisma.message.updateMany({
      where: {
        orderId,
        sender: { not: sender as MessageSender },
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marcando mensajes como leídos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


