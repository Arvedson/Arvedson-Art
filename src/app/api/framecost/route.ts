import { NextResponse, NextRequest } from "next/server"; // Importa NextRequest
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface FramePriceCreateData {
  width: number;
  height: number;
  price: number;
}

export async function GET() {
  try {
    const frames = await prisma.framePrice.findMany();
    return NextResponse.json(frames);
  } catch (error) {
    console.error("Error fetching frames:", error);
    return NextResponse.json(
      { error: "Error fetching frames" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { width, height, price } = body as Partial<FramePriceCreateData>;

    if (!width || !height || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newFrame = await prisma.framePrice.create({
      data: {
        width: Number(width),
        height: Number(height),
        price: Number(price),
      },
    });

    return NextResponse.json(newFrame, { status: 201 });
  } catch (error) {
    console.error("Error creating frame:", error);
    return NextResponse.json(
      { error: "Error creating frame" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) { // Elimina el parámetro 'context'
  try {
    const id = Number(request.nextUrl.searchParams.get("id")); // Obtiene el ID de los query params
    const body = await request.json();
    const { width, height, price } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

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

export async function DELETE(request: NextRequest) { // Elimina el parámetro 'context'
  try {
    const id = Number(request.nextUrl.searchParams.get("id")); // Obtiene el ID de los query params
    
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await prisma.framePrice.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Frame deleted successfully" });
  } catch (error) {
    console.error("Error deleting frame:", error);
    return NextResponse.json({ error: "Error deleting frame" }, { status: 500 });
  }
}