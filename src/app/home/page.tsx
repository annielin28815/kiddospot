"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Place } from "@/src/types/place";
import { useSession } from "next-auth/react";
import BrandLogo from "@/src/components/BrandLogo";
import PlacesClient from "@/src/components/PlaceClient";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    fetch("/api/places")
      .then((res) => res.json())
      .then((data) => {
        setPlaces(data)
      });
  }, []);

  return (
    <main className="h-dvh bg-brand-cream text-brand-ink dark:bg-[#1F1A17] dark:text-white">
      <section className="mx-auto flex h-full w-full max-w-[720px] flex-col">
        <header className="sticky top-0 z-10 shrink-0 border-b border-brand-line bg-brand-cream px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#1F1A17]/90">
          <div className="flex items-center gap-3">
            <BrandLogo size={42} showText={false} />
            <div>
              <h1 className="text-lg font-semibold leading-none">Kiddospot</h1>
              <p className="mt-1 text-xs text-brand-softInk dark:text-white/70">
                Little spots, big smiles.
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0">
          <PlacesClient places={places} />
        </div>
      </section>
    </main>
  )
}