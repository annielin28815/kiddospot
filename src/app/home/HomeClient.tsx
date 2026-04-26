"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import BrandLogo from "@/src/components/BrandLogo";
import PlacesClient from "@/src/components/PlaceClient";
import LoginButton from "@/src/components/LoginButton";
import { ui } from "@/src/lib/ui";
import { useMeta } from "@/src/hooks/useMeta";

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { tags: metaTags, facilities: metaFacilities, isLoading: isMetaLoading, } = useMeta();

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleOpenFavorites = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("favorite", "true");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleOpenCreate = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreate = () => {
    setShowCreateModal(false);
  };

  return (
    <main className="h-dvh text-brand-ink dark:bg-[#1F1A17] dark:text-white">
      <section className="mx-auto flex h-full w-full max-w-[720px] flex-col border-x-0 bg-white/65 md:border-x md:border-brand-line">
      <header className="sticky top-0 z-[1000] shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg-page)]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <BrandLogo size={42} showText={false} />

            <div className="min-w-0">
              <h1 className={`${ui.titleLg} leading-none text-[var(--color-text-primary)]`}>
                Kiddospot
              </h1>
              <p className={`${ui.caption} mt-1 text-[var(--color-text-secondary)]`}>
                Little spots, big smiles.
              </p>
            </div>
          </div>

          <LoginButton
            onOpenFavorites={handleOpenFavorites}
            onOpenCreate={handleOpenCreate}
            onMenuOpenChange={setIsUserMenuOpen}
          />
        </div>
      </header>

        <div className="min-h-0 flex-1">
          {!isMetaLoading && (
            <Suspense fallback={null}>
              <PlacesClient
                tags={metaTags}
                facilities={metaFacilities}
                showCreateModal={showCreateModal}
                onCloseCreateModal={handleCloseCreate}
                isUserMenuOpen={isUserMenuOpen}
                isFilterOpen={isFilterOpen}
                onFilterOpenChange={setIsFilterOpen}
              />
            </Suspense>
          )}
        </div>
      </section>
    </main>
  );
}