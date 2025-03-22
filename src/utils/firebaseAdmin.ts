import * as admin from "firebase-admin";

// Check if Firebase Admin SDK is already initialized
if (!admin.apps.length) {
    try {
        // Initialize Firebase Admin SDK with environment variables
        const firebaseConfig = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Corregir saltos de línea
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };

        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
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
    const file = bucket.file(`art-dav/${destinationFileName}`); // Ruta específica dentro del bucket
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
}