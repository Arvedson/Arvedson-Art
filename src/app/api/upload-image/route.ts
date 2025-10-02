import { bucket } from "@/utils/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 }
      );
    }

    // Validar tamaño (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen debe ser menor a 20MB" },
        { status: 400 }
      );
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileName = `art-dav/chat/${timestamp}_${file.name}`;
    const fileUpload = bucket.file(fileName);

    // Subir el archivo a Firebase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    await fileUpload.save(buffer, {
      metadata: { contentType: file.type },
    });

    // Generar URL firmada
    const [url] = await fileUpload.getSignedUrl({
      action: "read",
      expires: "01-01-2030",
    });

    return NextResponse.json({ imageUrl: url });
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
