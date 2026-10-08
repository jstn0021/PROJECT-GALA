import { redirect } from "next/navigation";
import { getSession } from "../../lib/session.js";
import { Background } from "../components/AuthCard";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  //const session = {
  //name: "Developer",
  //email: "dev@gala.local",
  //};

  const firstName = String(session.name || "").split(" ")[0] || "traveler";

  return (
    <Background>
      <DashboardClient name={firstName} email={session.email} />
    </Background>
  );
}
