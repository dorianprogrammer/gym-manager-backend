import { db } from "../config/firebase.js";

export async function getUserProfile(uid) {
  const snapUsers = await db.collection("users").doc(uid).get();

  if (snapUsers.exists) {
    const usersData = snapUsers.data();

    const snapGyms = await db.collection("gyms").doc(usersData.gymId).get();

    return { ...usersData, gym: snapGyms.data() };
  }

  return null;
}

export async function setUserProfile(uid, data) {
  await db
    .collection("profiles")
    .doc(uid)
    .set({ ...data, updatedAt: new Date() }, { merge: true });
}
