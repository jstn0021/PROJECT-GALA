import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "../../../lib/session.js";
import { Background } from "../../components/AuthCard";

const TITLES = {
  plans: "Plan details",
  journal: "Journal entry",
  destination: "Destination",
};

export default async function Detail({ params }) {
  const { section, id } = await params;
  const title = TITLES[section];
  if (!title) notFound();

  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <Background>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-4xl font-semibold">{title}</h1>
        <p className="text-white/70">ID: {id}</p>
        <Link href="/dashboard" className="glass rounded-xl px-4 py-2 text-sm">
          Back to dashboard
        </Link>
      </div>
    </Background>
  );
}
