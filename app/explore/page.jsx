
import { Suspense } from "react";
import ExploreClient from "./ExploreClient";

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-8 text-white">
          Loading Explore...
        </div>
      }
    >
      <ExploreClient />
    </Suspense>
  );
}
