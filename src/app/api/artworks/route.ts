import { PrismaClient } from "@prisma/client";
import { bucket } from "@/utils/firebaseAdmin";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server"; // Importa NextRequest
import { getImageDimensions } from "@/utils/imageUtils"; // Importa la función


const prisma = new PrismaClient();


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const order = parseInt(formData.get("order") as string);
    const medidas = formData.get("medidas") as string | null;
    const tecnica = formData.get("tecnica") as string | null;
    const marco = formData.get("marco") as string | null;
    const files = formData.getAll("images") as File[];

    if (!title || !description || !order || files.length === 0) {
      return new Response(
        JSON.stringify({ error: "Todos los campos son obligatorios" }),
        { status: 400 }
      );
    }

    const urls: string[] = [];
    for (const file of files) {
      const fileName = `art-dav/${title}/${file.name}`;
      const fileUpload = bucket.file(fileName);

      // Subir el archivo a Firebase Storage
      await fileUpload.save(Buffer.from(await file.arrayBuffer()), {
        metadata: { contentType: file.type },
      });

      // Generar una URL firmada para el archivo
      const [url] = await fileUpload.getSignedUrl({
        action: "read",
        expires: "01-01-2030", // Fecha de expiración (opcional)
      });
      urls.push(url);
    }

    // Obtener las dimensiones de la imagen principal
    const mainImageUrl = urls[0];
    const { width, height } = await getImageDimensions(mainImageUrl);

    // Crear la obra de arte en la base de datos
    const newArtwork = await prisma.artwork.create({
      data: {
        title,
        description,
        mainImageUrl,
        width,
        height,
        order,
        medidas,
        tecnica,
        marco,
        subImages: {
          create: urls.slice(1).map((url) => ({ imageUrl: url })), // Guardar subimágenes
        },
      },
    });

    return new Response(JSON.stringify(newArtwork), { status: 201 });
  } catch (error) {
    console.error("Error al crear el cuadro:", error);
    return new Response(
      JSON.stringify({ error: "Error al crear el cuadro" }),
      { status: 500 }
    );
  }
}

// GET: Obtener todas las obras de arte
export async function GET() {
  try {
    const artworks = await prisma.artwork.findMany({
      include: { subImages: true }, // Incluir las subimágenes asociadas
      orderBy: { order: "asc" }, // Ordenar por el campo 'order'
    });
    return new Response(JSON.stringify(artworks), { status: 200 });
  } catch (error) {
    console.error("Error al obtener los cuadros:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener los cuadros" }),
      { status: 500 }
    );
  }
}

// PUT: Actualizar el orden de los cuadros
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { artworks } = body;

    if (!Array.isArray(artworks)) {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud debe ser un array de artworks" },
        { status: 400 }
      );
    }

    for (const artwork of artworks) {
      const { id, order } = artwork;

      if (!id || !Number.isInteger(order)) {
        return NextResponse.json(
          { error: "Cada artwork debe tener un 'id' y un 'order' válido" },
          { status: 400 }
        );
      }

      // Actualizar el orden del cuadro en la base de datos
      await prisma.artwork.update({
        where: { id },
        data: { order: Number(order) },
      });
    }

    return NextResponse.json(
      { message: "Orden actualizado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar el orden" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un cuadro y sus subimágenes asociadas
export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(new URL(req.url).searchParams.get("id") || "");

    if (!id) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Eliminar las subimágenes asociadas
    await prisma.subImage.deleteMany({ where: { artworkId: id } });

    // Eliminar el cuadro
    await prisma.artwork.delete({ where: { id } });

    return NextResponse.json(
      { message: "Cuadro eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar el cuadro" },
      { status: 500 }
    );
  }
}