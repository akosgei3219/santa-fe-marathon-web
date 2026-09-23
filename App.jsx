import React from "react";
import UrgencyBanner from "./urgency-banner.jsx";
import Hero from "./hero.jsx";
import Timer from "./timer.jsx";
import Sponsors from "./sponsors.jsx";

// Full homepage preview: stacks the campaign banner, hero, countdown, and sponsors.
export default function App() {
  return (
    <main className="min-h-screen bg-stone-100">
      <UrgencyBanner />
      <Hero />
      <Timer />
      <Sponsors />
    </main>
  );
}
