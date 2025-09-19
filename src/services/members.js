const { db } = require("../config/firebase");

async function listMembersByGym({ gymId, pageSize = 25, cursor }) {
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

  console.log("members :>> ", members);

  return { members };
}

module.exports = { listMembersByGym };
