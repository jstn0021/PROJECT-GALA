import { redirect } from "next/navigation";
import { Background } from "app/components/AuthCard";
import Navbar from "app/components/Navbar";
import { getAdmin } from "lib/adminAuth";
import { getCredits } from "lib/credits";
import AdminTabs from "../AdminTabs";
import CreditsClient from "./CreditsClient";

export const dynamic = "force-dynamic";

export default async function AdminCreditsPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/dashboard");

  const credits = await getCredits();

  return (
    <Background>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-white md:px-8 md:py-6 xl:px-12">
        <Navbar />
        <main>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Admin</h1>
          <AdminTabs active="credits" />
          <p className="mt-4 text-white/70">
            The people credited on the landing page. Photos: JPG, PNG or WEBP,
            max 5 MB.
          </p>
          <CreditsClient credits={credits} />
        </main>
      </div>
    </Background>
  );
}
