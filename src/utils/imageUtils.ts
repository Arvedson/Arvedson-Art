import https from "https";
import { imageSize } from "image-size";

export async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const validatedImageUrl = validateAndCleanImageUrl(imageUrl);
    if (!validatedImageUrl) {
      reject(new Error("La URL de la imagen no es válida."));
      return;
    }

    https.get(validatedImageUrl, (response) => {
      if (!processHttpResponse(response, reject)) return;

      const chunks: Uint8Array[] = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        try {
          const buffer = Buffer.concat(chunks);
          if (buffer.length === 0) {
            reject(new Error("No se recibieron datos de la imagen."));
            return;
          }

          const dimensions = imageSize(buffer);
          if (!dimensions || !dimensions.width || !dimensions.height) {
            reject(new Error("Formato de imagen no compatible o archivo corrupto."));
            return;
          }

          resolve({ width: dimensions.width, height: dimensions.height });
        } catch (error) {
          console.error("Error al procesar la imagen:", error);
          reject(error);
        }
      });

      response.on("error", (err) => {
        console.error("Error en la solicitud HTTP:", err.message);
        reject(err);
      });

      response.on("close", () => {
        if (!response.complete) {
          reject(new Error("Conexión cerrada prematuramente. Descarga incompleta."));
        }
      });
    }).on("error", (err) => {
      console.error("Error inicial en la solicitud HTTP:", err.message);
      reject(err);
    });
  });
}

function validateAndCleanImageUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      throw new Error("Protocolo no soportado.");
    }
    return urlObj.toString();
  } catch (error) {
    console.error("URL inválida:", error.message);
    return null;
  }
}

function processHttpResponse(response: any, reject: (reason?: any) => void): boolean {
  if (response.statusCode !== 200) {
    const error = new Error(`Error al descargar la imagen: Código de estado ${response.statusCode}`);
    console.error(error.message);
    reject(error);
    return false;
  }
  return true;
}