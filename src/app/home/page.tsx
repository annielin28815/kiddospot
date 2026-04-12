"use client";

import { useEffect, useState } from "react";
import { Place } from "@/src/types/place";
import BrandLogo from "@/src/components/BrandLogo";
import PlacesClient from "@/src/components/PlaceClient";
import LoginButton from "@/src/components/LoginButton";

type FilterOption = {
  id: string;
  name: string;
};

type MetaResponse = {
  tags: FilterOption[];
  facilities: FilterOption[];
};

type PlacesResponse = {
  places: Place[];
  total: number;
};

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [tags, setTags] = useState<FilterOption[]>([]);
  const [facilities, setFacilities] = useState<FilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [placesRes, metaRes] = await Promise.all([
          fetch("/api/places"),
          fetch("/api/meta"),
        ]);

        const placesData: PlacesResponse = await placesRes.json();
        const metaData: MetaResponse = await metaRes.json();

        setPlaces(placesData.places ?? []);
        setTags(metaData.tags ?? []);
        setFacilities(metaData.facilities ?? []);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        setPlaces([]);
        setTags([]);
        setFacilities([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  return (
    <main className="h-dvh text-brand-ink dark:bg-[#1F1A17] dark:text-white">
      <section className="mx-auto flex h-full w-full max-w-[720px] flex-col border-x-0 md:border-x md:border-brand-line bg-white/65">
        <header className="sticky top-0 z-10 shrink-0 flex justify-between border-b border-brand-line bg-brand-cream px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#1F1A17]/90">
          <div className="flex items-center gap-3">
            <BrandLogo size={42} showText={false} />
            <div>
              <h1 className="text-lg font-semibold leading-none">Kiddospot</h1>
              <p className="mt-1 text-xs text-brand-softInk dark:text-white/70">
                Little spots, big smiles.
              </p>
            </div>
          </div>
          <LoginButton />
        </header>

        <div className="flex-1 min-h-0">
        {!isLoading && (
            <PlacesClient
              initialPlaces={places}
              tags={tags}
              facilities={facilities}
            />
          )}
        </div>
      </section>
    </main>
  )
}