import * as admin from "firebase-admin";

// Verificar que todas las variables de entorno requeridas estén definidas
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_STORAGE_BUCKET'
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Falta la variable de entorno requerida: ${varName}`);
  }
}

if (!admin.apps.length) {
  try {
    console.log("Inicializando Firebase Admin SDK...");

    // Construir el objeto de credenciales a partir de las variables separadas usando camelCase
    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      // Reemplaza las secuencias "\n" por saltos de línea reales
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    };

    console.log("Credenciales preparadas.");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
    });

    console.log("Firebase Admin SDK inicializado correctamente");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error crítico en inicialización:", error);
    throw new Error("Fallo en Firebase Admin SDK: " + errorMessage);
  }
}

export const bucket = admin.storage().bucket();
