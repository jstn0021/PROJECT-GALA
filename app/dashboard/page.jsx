import { redirect } from "next/navigation";
import { getSession } from "../../lib/session.js";
import { Background } from "../components/AuthCard";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  //const session = await getSession();
  //if (!session) redirect("/login");

  const session = {
    Name: "Earl-chris",
    Email: "christian11earl07@gmail.com",
  };

  const firstName = String(session.name || "").split(" ")[0] || "traveler";

  return (
    <Background>
      <DashboardClient name={firstName} email={session.email} />
    </Background>
  );
}

