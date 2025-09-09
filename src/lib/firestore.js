// src/lib/firestore.js
import { db } from "../config/firebase.js";

export async function getUserProfile(uid) {
  const snap = await db.collection("profiles").doc(uid).get();
  return snap.exists ? snap.data() : null;
}

export async function setUserProfile(uid, data) {
  await db.collection("profiles").doc(uid).set(
    { ...data, updatedAt: new Date() },
    { merge: true }
  );
}
