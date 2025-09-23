import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as admin from "firebase-admin";


function buildCredentialFromEnv() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }
  return null;
}

let app;
let initialized = false;

try {
  const credential = buildCredentialFromEnv() ?? applicationDefault();
  app = initializeApp({
    credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // optional
  });
  initialized = true;
} catch (e) {
  console.error("Firebase Admin init error:", e);
}

export const firebaseApp = app;
export const isFirebaseReady = () => initialized;

export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;
export const storage = app ? getStorage(app) : undefined;
export const bucket = storage?.bucket();
export { admin };


export async function checkFirebaseReady() {
  if (!initialized || !auth) return false;
  try {
    await auth.listUsers(1);
    return true;
  } catch {
    return false;
  }
}
