import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";

export async function countMembersByGym({ gymId }) {
  let q = db.collection("gyms").doc(gymId).collection("members").count();
  const snap = await q.get();
  return snap.data().count;
}

export async function countActiveMembersByGym({ gymId }) {
  let q = db
    .collection("gyms")
    .doc(gymId)
    .collection("members")
    .where("status", "==", "active")
    .count();
  const snap = await q.get();
  return snap.data().count;
}

export async function countCheckinsTodayByGym({ gymId }) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  let q = db
    .collection("gyms")
    .doc(gymId)
    .collection("checkins")
    .where("at", ">=", Timestamp.fromDate(start))
    .where("at", "<", Timestamp.fromDate(end))
    .count();

  const snap = await q.get();

  return snap.data().count;
}

export async function sumDailyRevenueByGym({ gymId, now = new Date() }) {
  try {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const snap = await db
      .collection("gyms")
      .doc(gymId)
      .collection("payments ")
      .where("createdAt", ">=", Timestamp.fromDate(start))
      .where("createdAt", "<", Timestamp.fromDate(end))
      .get();

    let total = 0;

    snap.forEach((d) => {
      const data = d.data();

      if (data?.status != "confirmed") return;
      const a = data.amount;
      const n = typeof a === "string" ? Number(a) : a;
      if (typeof n === "number" && !Number.isNaN(n)) total += n;
    });

    return total;
  } catch (error) {
    console.log("error :>> ", error);
    return 0;
  }
}
