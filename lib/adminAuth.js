import { getSession } from "./session.js";
import User from "../db/models/user.js";

// Kinukuha ang user mula sa DATABASE (hindi sa cookie lang), kaya agad
// tumatalab ang disable at ang pagbabago ng role.
export async function getActiveUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await User.findByPk(session.uid);
  if (!user || user.disabled) return null;
  return user;
}

export async function getAdmin() {
  const user = await getActiveUser();
  return user && user.role === "superadmin" ? user : null;
}
