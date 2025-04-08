import { NextResponse, NextRequest } from "next/server";
import type { Params } from 'next'; // Importa Params
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Params } // Cambio clave aquí
) {
  try {
    const body = await request.json();
    const { width, height, price } = body;
    const id = Number(params.id); // Convierte a número

    const updatedFrame = await prisma.framePrice.update({
      where: { id },
      data: {
        width: Number(width),
        height: Number(height),
        price: Number(price),
      },
    });

    return NextResponse.json(updatedFrame);
  } catch (error) {
    console.error("Error updating frame:", error);
    return NextResponse.json({ error: "Error updating frame" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params } // Cambio clave aquí
) {
  try {
    const id = Number(params.id);
    
    await prisma.framePrice.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Frame deleted successfully" });
  } catch (error) {
    console.error("Error deleting frame:", error);
    return NextResponse.json({ error: "Error deleting frame" }, { status: 500 });
  }
}