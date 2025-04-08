import * as admin from "firebase-admin";

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_BASE64', // <--- ¡Clave en Base64!
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_STORAGE_BUCKET'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing: ${varName}`);
  }
});

if (!admin.apps.length) {
    try {
      const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64!;
      console.log("Base64 recibido:", privateKeyBase64); // Debug 1
  
      const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf8");
      console.log("Clave decodificada:", privateKey); // Debug 2
  
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          privateKey: privateKey.replace(/\\n/g, "\n"),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
      });
    } catch (error) {
      console.error("Error detallado:", error); // Debug 3
      throw new Error(`Firebase init faiiled: ${error}`);
    }
  }

export const bucket = admin.storage().bucket();