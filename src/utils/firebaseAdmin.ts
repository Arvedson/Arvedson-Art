import * as admin from "firebase-admin";
import * as fs from 'fs';

// Check if Firebase Admin SDK is already initialized
if (!admin.apps.length) {
    try {
        let credential;

        // 1. Check for FIREBASE_CREDENTIALS (Service Account JSON)
        if (process.env.FIREBASE_CREDENTIALS) {
            try {
                // Attempt to parse as JSON (for Vercel or direct JSON string)
                const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);
                credential = admin.credential.cert(credentials);
            } catch (_jsonError) {
                // If parsing fails, assume it's a file path (for local development)
                if (fs.existsSync(process.env.FIREBASE_CREDENTIALS)) {
                    credential = admin.credential.cert(process.env.FIREBASE_CREDENTIALS);
                } else {
                    console.error("Error: FIREBASE_CREDENTIALS no es un JSON válido ni una ruta de archivo existente.");
                    throw new Error("Invalid Firebase Credentials");
                }
            }
        } 
        // 2. Fallback to individual env variables (less preferred, but kept for compatibility)
        else if (
            process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_PRIVATE_KEY &&
            process.env.FIREBASE_CLIENT_EMAIL
        ) {
            const firebaseConfig = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Important: Handle newlines
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            };
            credential = admin.credential.cert(firebaseConfig);
        }
        // 3.  Use Application Default Credentials (for some Vercel setups, or Google Cloud)
        else if (process.env.FIREBASE_PROJECT_ID) {
             credential = admin.credential.applicationDefault();
        }
        else {
            throw new Error(
                "Error: No se proporcionaron credenciales de Firebase.  Debes configurar la variable de entorno FIREBASE_CREDENTIALS o las variables FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY y FIREBASE_CLIENT_EMAIL."
            );
        }
        

        admin.initializeApp({
            credential: credential,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
        console.log("Firebase Admin SDK inicializado correctamente.");
    } catch (error) {
        console.error("Error al inicializar Firebase Admin SDK:", error);
        throw new Error("No se pudo inicializar Firebase Admin SDK.");
    }
}

export const bucket = admin.storage().bucket();

// Función para subir archivos al bucket en la carpeta 'art-dav'
export async function uploadFileToFirebase(
    filePath: string,
    destinationFileName: string
): Promise<string> {
    const file = bucket.file(`art-dav/${destinationFileName}`);
    try {
        await bucket.upload(filePath, {
            destination: file.name,
            public: true, // Hacer el archivo público (opcional)
        });
        console.log("Archivo subido correctamente.");

        // Obtener la URL pública del archivo
        const [url] = await file.getSignedUrl({
            action: "read",
            expires: "03-09-2491", // Fecha de expiración (opcional)
        });
        console.log("URL del archivo:", url);
        return url;
    } catch (error) {
        console.error("Error al subir el archivo a Firebase Storage:", error);
        throw new Error("Error al subir el archivo.");
    }
}
