import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64!;
    const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf8');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n') // Corrige saltos de línea
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log("Firebase inicializado correctamente");
  } catch (error) {
    console.error("Error de inicialización:", error);
    throw new Error("Error crítico en Firebase");
  }
}

export const bucket = admin.storage().bucket();

