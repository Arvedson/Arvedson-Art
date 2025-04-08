import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getClosestColor } from '@/utils/colorMapping';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { palette, image } = body;
        const imageBuffer = Buffer.from(image, "base64");

        // Convertir imagen a formato RAW para obtener los valores de los píxeles
        const { data, info } = await sharp(imageBuffer).raw().toBuffer({ resolveWithObject: true });

        // Transformar los colores
        for (let i = 0; i < data.length; i += 3) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const [newR, newG, newB] = getClosestColor([r, g, b], palette);
            data[i] = newR;
            data[i + 1] = newG;
            data[i + 2] = newB;
        }

        // Convertir de vuelta a imagen
        const transformedImage = await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
            .png()
            .toBuffer();

        return new NextResponse(transformedImage, {
            headers: { "Content-Type": "image/png" },
        });
    } catch (error) {
        console.error("Error procesando la imagen:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}