import { Suspense } from "react";
import { LandingApp } from "@/components/LandingApp";

export default function Home() {
  return (
    <Suspense>
      <LandingApp />
    </Suspense>
  );
}
