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
    const privateKey = Buffer.from(
      process.env.FIREBASE_PRIVATE_KEY_BASE64!, 
      "base64"
    ).toString("utf8");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKey: privateKey.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
    });
  } catch (error) {
    throw new Error(`Firebase init failed: ${error}`);
  }
}

export const bucket = admin.storage().bucket();