import { redirect } from "next/navigation";
import { Background } from "app/components/AuthCard";
import Navbar from "app/components/Navbar";
import { getAdmin } from "lib/adminAuth";
import AdminTabs from "../AdminTabs";
import { getSiteImages } from "lib/siteImages";
import { SLOTS } from "lib/siteSlots";
import ImagesClient from "./ImagesClient";

export const dynamic = "force-dynamic";

export default async function AdminImagesPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/dashboard");

  const custom = await getSiteImages();

  return (
    <Background>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-white md:px-8 md:py-6 xl:px-12">
        <Navbar />
        <main>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Admin</h1>
          <AdminTabs active="images" />
          <p className="mt-4 text-white/70">
            Replace or remove the photos on the landing page. JPG, PNG or WEBP,
            max 5 MB.
          </p>
          <ImagesClient slots={SLOTS} custom={custom} />
        </main>
      </div>
    </Background>
  );
}
