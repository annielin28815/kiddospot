"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleOpenFavorites = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("favorite", "true");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCloseFavorites = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("favorite");
    const nextQuery = params.toString();
    router.push(nextQuery ? `?${nextQuery}` : "/", { scroll: false });
  };

  const handleOpenCreate = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreate = () => {
    setShowCreateModal(false);
  };

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
      <section className="mx-auto flex h-full w-full max-w-[720px] flex-col border-x-0 bg-white/65 md:border-x md:border-brand-line">
        <header className="sticky top-0 z-[1000] flex shrink-0 justify-between border-b border-brand-line bg-brand-cream px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#1F1A17]/90">
          <div className="flex items-center gap-3">
            <BrandLogo size={42} showText={false} />
            <div>
              <h1 className="text-lg font-semibold leading-none">Kiddospot</h1>
              <p className="mt-1 text-xs text-brand-softInk dark:text-white/70">
                Little spots, big smiles.
              </p>
            </div>
          </div>

          <LoginButton
            onOpenFavorites={handleOpenFavorites}
            onOpenCreate={handleOpenCreate}
            onMenuOpenChange={setIsUserMenuOpen}
          />
        </header>

        <div className="min-h-0 flex-1">
          {!isLoading && (
            <PlacesClient
              initialPlaces={places}
              tags={tags}
              facilities={facilities}
              showCreateModal={showCreateModal}
              onCloseCreateModal={handleCloseCreate}
              isUserMenuOpen={isUserMenuOpen}
              isFilterOpen={isFilterOpen}
              onFilterOpenChange={setIsFilterOpen}
            />
          )}
        </div>
      </section>
    </main>
  );
}