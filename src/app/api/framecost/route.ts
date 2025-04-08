import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Función PUT corregida
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { width, height, price } = body;

    const updatedFrame = await prisma.framePrice.update({
      where: { id: Number(id) },
      data: {
        width: Number(width),
        height: Number(height),
        price: Number(price),
      },
    });

    return NextResponse.json(updatedFrame);
  } catch (error) {
    console.error("Error updating frame:", error);
    return NextResponse.json(
      { error: "Error updating frame" },
      { status: 500 }
    );
  }
}

// Función DELETE corregida
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.framePrice.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Frame deleted successfully" });
  } catch (error) {
    console.error("Error deleting frame:", error);
    return NextResponse.json(
      { error: "Error deleting frame" },
      { status: 500 }
    );
  }
}
