import { db } from "../config/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

export async function listMembersByGym({ gymId, pageSize = 25, cursor }) {
  let q = db
    .collection("gyms")
    .doc(gymId)
    .collection("members")
    .orderBy("joinDate", "desc")
    .limit(pageSize);

  const snap = await q.get();

  const members = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? null,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
    };
  });

  return { members };
}

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
