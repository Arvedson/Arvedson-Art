import { PrismaClient } from "@prisma/client";
 import { bucket } from "@/utils/firebaseAdmin";
 import { NextResponse } from "next/server";
 import { NextRequest } from "next/server";
 import { getImageDimensions } from "@/utils/imageUtils";
 
 const prisma = new PrismaClient();
 

// POST Corregido
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Validación y casteo seguro
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const price = Number(formData.get("price"));
    const stockQuantity = Number(formData.get("stockQuantity"));
    const files = formData.getAll("images").filter((f): f is File => f instanceof File);

    // Validación mejorada
    if (!title || !description || isNaN(price) || isNaN(stockQuantity) || files.length === 0) {
      return NextResponse.json(
        { error: "Datos de entrada inválidos" },
        { status: 400 }
      );
    }

    // Subida de archivos
    const urls: string[] = [];
    for (const file of files) {
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `art-dav/stock/${sanitizedTitle}/${Date.now()}_${file.name}`;
      const fileUpload = bucket.file(fileName);
      
      const buffer = Buffer.from(await file.arrayBuffer());
      await fileUpload.save(buffer, {
        metadata: { contentType: file.type },
      });

      const [url] = await fileUpload.getSignedUrl({
        action: "read",
        expires: "01-01-2030",
      });
      urls.push(url);
    }

    // Creación en base de datos
    const newArtwork = await prisma.stockArtwork.create({
      data: {
        title,
        description,
        mainImageUrl: urls[0],
        price,
        stockQuantity,
        order: Number(formData.get("order")) || 0,
        medidas: formData.get("medidas")?.toString(),
        tecnica: formData.get("tecnica")?.toString(),
        marco: formData.get("marco")?.toString(),
        subImages: {
          create: urls.slice(1).map(url => ({ imageUrl: url })),
        },
        // Asegurar que getImageDimensions funciona con URLs de Firebase
        ...(await getImageDimensions(urls[0])),
      },
    });

    return NextResponse.json(newArtwork, { status: 201 });
  } catch (error) {
    console.error("Error POST:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


// GET Corregido
export async function GET() {
  try {
    const artworks = await prisma.stockArtwork.findMany({
      include: { subImages: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(artworks, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error("Error GET:", error);
    return NextResponse.json(
      { error: "Error al obtener datos" },
      { status: 500 }
    );
  }
}
 
 

 // DELETE: Eliminar un cuadro en stock y sus subimágenes asociadas
 export async function DELETE(req: NextRequest) {
  try {
    console.log("Iniciando DELETE...");
    const id = parseInt(new URL(req.url).searchParams.get("id") || "");
    console.log("ID recibido:", id);

    if (!id) {
      console.error("ID inválido");
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Buscar la obra
    console.log("Buscando artwork con ID:", id);
    const artwork = await prisma.stockArtwork.findUnique({
      where: { id },
      include: { subImages: true },
    });

    if (!artwork) {
      console.error("Artwork no encontrado");
      return NextResponse.json({ error: "Artwork no encontrado" }, { status: 404 });
    }

    console.log("Eliminando imágenes de Firebase...");
    // Eliminar imagen principal
    try {
      const mainImagePath = decodeURIComponent(
        new URL(artwork.mainImageUrl).pathname.split('/o/')[1].split('?')[0]
      );
      console.log("Eliminando imagen principal:", mainImagePath);
      await bucket.file(mainImagePath).delete();
    } catch (error) {
      console.error("Error eliminando imagen principal:", error);
    }

    // Eliminar subimágenes
    for (const subImage of artwork.subImages) {
      try {
        const subImagePath = decodeURIComponent(
          new URL(subImage.imageUrl).pathname.split('/o/')[1].split('?')[0]
        );
        console.log("Eliminando subimagen:", subImagePath);
        await bucket.file(subImagePath).delete();
      } catch (error) {
        console.error("Error eliminando subimagen:", error);
      }
    }

    console.log("Eliminando registros de la base de datos...");
    await prisma.stockSubImage.deleteMany({ where: { stockArtworkId: id } });
    await prisma.stockArtwork.delete({ where: { id } });

    return NextResponse.json(
      { message: "Cuadro en stock eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en DELETE:", error);
    return NextResponse.json(
      { error: "Error al eliminar el cuadro en stock" },
      { status: 500 }
    );
  }
}