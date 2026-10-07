import { redirect } from "next/navigation";
import { Background } from "app/components/AuthCard";
import LandingContent, { BRAND } from "app/components/LandingContent";
import { getSession } from "lib/session";

export const metadata = { title: `${BRAND} | Plan your next adventure` };

export default async function Home() {
  // Naka-login na? diretso sa dashboard.
  let session = null;
  try {
    session = await getSession();
  } catch {}
  if (session) redirect("/dashboard");

  return (
    <Background>
      <LandingContent />
    </Background>
  );
}
