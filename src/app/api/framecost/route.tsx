import { NextResponse } from "next/server";
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