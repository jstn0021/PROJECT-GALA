import { redirect } from "next/navigation";
import { getSession } from "../lib/session.js";

export default async function Index() {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
}
