import { PrismaClient } from "@prisma/client";
import { bucket } from "@/utils/firebaseAdmin";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getImageDimensions } from "@/utils/imageUtils";

const prisma = new PrismaClient();

// POST: Crear un nuevo cuadro en stock
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stockQuantity = parseInt(formData.get("stockQuantity") as string);
    const order = parseInt(formData.get("order") as string) || 0; // Nuevo campo para orden
    const medidas = formData.get("medidas") as string | null;
    const tecnica = formData.get("tecnica") as string | null;
    const marco = formData.get("marco") as string | null;
    const files = formData.getAll("images") as File[];

    if (!title || !description || !price || !stockQuantity || files.length === 0) {
      return new Response(
        JSON.stringify({ error: "Todos los campos obligatorios deben ser proporcionados" }),
        { status: 400 }
      );
    }

    const urls: string[] = [];
    for (const file of files) {
      const fileName = `art-dav/stock/${title}/${file.name}`;
      const fileUpload = bucket.file(fileName);

      await fileUpload.save(Buffer.from(await file.arrayBuffer()), {
        metadata: { contentType: file.type },
      });

      const [url] = await fileUpload.getSignedUrl({
        action: "read",
        expires: "01-01-2030",
      });
      urls.push(url);
    }

    const mainImageUrl = urls[0];
    const { width, height } = await getImageDimensions(mainImageUrl);

    const newStockArtwork = await prisma.stockArtwork.create({
      data: {
        title,
        description,
        mainImageUrl,
        width,
        height,
        price,
        stockQuantity,
        order,
        medidas,
        tecnica,
        marco,
        subImages: {
          create: urls.slice(1).map((url) => ({ imageUrl: url })),
        },
      },
    });

    return new Response(JSON.stringify(newStockArtwork), { status: 201 });
  } catch (error) {
    console.error("Error al crear el cuadro en stock:", error);
    return new Response(
      JSON.stringify({ error: "Error al crear el cuadro en stock" }),
      { status: 500 }
    );
  }
}

// GET: Obtener todos los cuadros en stock ordenados
export async function GET() {
  try {
    const stockArtworks = await prisma.stockArtwork.findMany({
      include: { subImages: true },
      orderBy: { order: "asc" }, // Ordenar por el campo 'order'
    });
    return new Response(JSON.stringify(stockArtworks), { status: 200 });
  } catch (error) {
    console.error("Error al obtener los cuadros en stock:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener los cuadros en stock" }),
      { status: 500 }
    );
  }
}

// PUT: Actualizar el orden de los cuadros en stock
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

    const updatePromises = artworks.map((artwork) => {
      const { id, order } = artwork;

      if (!id || !Number.isInteger(order)) {
        throw new Error("Cada artwork debe tener un 'id' y un 'order' válido");
      }

      return prisma.stockArtwork.update({
        where: { id },
        data: { order: Number(order) },
      });
    });

    await Promise.all(updatePromises);

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

// DELETE: Eliminar un cuadro en stock y sus subimágenes asociadas
export async function DELETE(req: NextRequest) {
  try {
    const idParam = new URL(req.url).searchParams.get("id");
    const id = idParam ? parseInt(idParam) : NaN;

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const artwork = await prisma.stockArtwork.findUnique({
      where: { id },
      include: { subImages: true },
    });

    if (!artwork) {
      return NextResponse.json({ error: "Cuadro no encontrado" }, { status: 404 });
    }

    // Eliminar imagen principal si existe
    if (artwork.mainImageUrl) {
      try {
        const mainImageUrl = new URL(artwork.mainImageUrl);
        const mainImagePath = decodeURIComponent(
          mainImageUrl.pathname.split('/o/')[1]?.split('?')[0] || ''
        );

        if (mainImagePath) {
          await bucket.file(mainImagePath).delete();
        }
      } catch (error) {
        console.error("Error al procesar la URL de la imagen principal:", error);
      }
    }

    // Eliminar subimágenes si existen
    for (const subImage of artwork.subImages) {
      if (subImage.imageUrl) {
        try {
          const subImageUrl = new URL(subImage.imageUrl);
          const subImagePath = decodeURIComponent(
            subImageUrl.pathname.split('/o/')[1]?.split('?')[0] || ''
          );

          if (subImagePath) {
            await bucket.file(subImagePath).delete().catch(console.error);
          }
        } catch (error) {
          console.error("Error al procesar la URL de la subimagen:", error);
        }
      }
    }

    // Eliminar las subimágenes de la base de datos
    await prisma.stockSubImage.deleteMany({ where: { stockArtworkId: id } });

    // Eliminar el cuadro principal
    await prisma.stockArtwork.delete({ where: { id } });

    return NextResponse.json(
      { message: "Cuadro en stock eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar el cuadro en stock:", error);
    return NextResponse.json(
      { error: "Error al eliminar el cuadro en stock" },
      { status: 500 }
    );
  }
}
