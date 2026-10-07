import { redirect } from "next/navigation";
import { Background } from "app/components/AuthCard";
import LandingContent, { BRAND } from "app/components/LandingContent";
import { getSession } from "lib/session";
import { getSiteImages } from "lib/siteImages";
import { getCredits } from "lib/credits";

export const metadata = { title: `${BRAND} | Plan your next adventure` };

export default async function Home() {
  let session = null;
  try {
    session = await getSession();
  } catch {}
  if (session) redirect("/dashboard");

  const [images, credits] = await Promise.all([getSiteImages(), getCredits()]);

  return (
    <Background>
      <LandingContent images={images} credits={credits} />
    </Background>
  );
}
