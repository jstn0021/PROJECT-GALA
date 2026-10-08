import { Suspense } from "react";
import { getSession } from "@/lib/session";
import ExploreClient from "./ExploreClient";

export const metadata = {
  title: "Explore Destinations | PROJECT-GALA",
  description:
    "PROJECT-GALA: Gawing mas makulay ang bawat gala!",
};

export default async function ExplorePage() {
  let session = null;
  try {
    session = await getSession();
  } catch {
    session = null;
  }

  const isLoggedIn = Boolean(session);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
            <span className="text-sm text-teal-200">Naglo-load ng mga galaan...</span>
          </div>
        </div>
      }
    >
      <ExploreClient initialIsLoggedIn={isLoggedIn} user={session} />
    </Suspense>
  );
}
