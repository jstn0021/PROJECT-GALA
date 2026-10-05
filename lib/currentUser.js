import { getSession } from "./lib/session.js";
// Ibinabalik ang { id, name } ng naka-login, o null kung hindi naka-login.
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
 
  // Ang laman ng session ni lead: { uid, name, email }
  return { id: session.uid, name: session.name };
}
 