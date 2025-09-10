import { auth } from "../config/firebase.js";

export async function requireAuth(req, _res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return next(Object.assign(new Error("Missing Bearer token"), { status: 401 }));

    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    next(Object.assign(new Error("Invalid or expired token"), { status: 401 }));
  }
}
