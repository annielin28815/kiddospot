"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import { Heart, List, MapPinPlus, MapPinned } from "lucide-react";
import { createPortal } from "react-dom";
import { ui } from "@/src/lib/ui";

import type { Place } from "@/src/types/place";
import PlaceList from "./PlaceList";
import SearchFilterBar from "./SearchFilterBar";
import AddPlaceForm from "./AddPlaceForm";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

type FilterOption = {
  id: string;
  name: string;
};

type SourceFilterValue = "all" | "user" | "familyToilet";

type SearchFilterValue = {
  keyword: string;
  tagIds: string[];
  facilityIds: string[];
  source: SourceFilterValue;
};

type PlacesApiResponse = {
  places: Place[];
  total: number;
};

type PlacesClientProps = {
  initialPlaces: Place[];
  tags: FilterOption[];
  facilities: FilterOption[];
  showCreateModal: boolean;
  onCloseCreateModal: () => void;
  isUserMenuOpen: boolean;
  isFilterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
};

type ExternalPlace = Place & {
  sourceType?: "GOV_FAMILY_TOILET" | "GOV_NURSING_ROOM" | "GOV_PARENTING_CENTER";
  sourceLabel?: string;
  city?: string | null;
  district?: string | null;
  phone?: string | null;
  openTime?: string | null;
  note?: string | null;
  officialUrl?: string | null;
};

type ExternalPlacesApiResponse = {
  places: ExternalPlace[];
  total: number;
};

const fetcher = async (url: string): Promise<PlacesApiResponse> => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch places");
  }

  return res.json();
};

export default function PlacesClient({
  initialPlaces,
  tags,
  facilities,
  showCreateModal,
  onCloseCreateModal,
  isUserMenuOpen,
  isFilterOpen,
  onFilterOpenChange,
}: PlacesClientProps) {
  const { data: session, status } = useSession();

  const userId = status === "authenticated" ? session.user.id : "";
  const isLoggedIn = status === "authenticated";

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);
  const shouldHideFloatingToggle = isUserMenuOpen || isFilterOpen || showCreateModal;
  
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const showFavoritesOnly = searchParams.get("favorite") === "true";

  const keyword = searchParams.get("keyword") || "";
  const tagIds = searchParams.getAll("tags");
  const facilityIds = searchParams.getAll("facilities");

  const source = (searchParams.get("source") as SourceFilterValue) || "all";

  const filters: SearchFilterValue = {
    keyword,
    tagIds,
    facilityIds,
    source,
  };

  const selectedFacilityNames = useMemo(() => {
    return facilities
      .filter((facility) => facilityIds.includes(facility.id))
      .map((facility) => facility.name);
  }, [facilities, facilityIds]);

  const queryString = searchParams.toString();

  const shouldFetchUserPlaces = source === "all" || source === "user";
  const shouldFetchExternalPlaces = (source === "all" || source === "familyToilet") && tagIds.length === 0;
  
  const placesApiUrl = shouldFetchUserPlaces
    ? queryString
      ? `/api/places?${queryString}`
      : `/api/places`
    : null;

    const externalParams = new URLSearchParams();

    if (keyword.trim()) {
      externalParams.set("keyword", keyword.trim());
    }
    
    if (source === "familyToilet") {
      externalParams.append("sourceTypes", "GOV_FAMILY_TOILET");
    }
    
    selectedFacilityNames.forEach((name) => {
      externalParams.append("facilityNames", name);
    });
    
    externalParams.set("hasLatLngOnly", "true");
    
    const externalPlacesApiUrl =
      shouldFetchExternalPlaces
        ? `/api/external-places?${externalParams.toString()}`
        : null;

  // const placesApiUrl = queryString ? `/api/places?${queryString}` : `/api/places`;
  // const externalPlacesApiUrl = queryString
  //   ? `/api/external-places?${queryString}&hasLatLngOnly=true`
  //   : `/api/external-places?hasLatLngOnly=true`;

  const {
    data: placesData,
    isLoading: isPlacesLoading,
    mutate,
  } = useSWR<PlacesApiResponse>(
    placesApiUrl,
    fetcher,
    {
      fallbackData: shouldFetchUserPlaces
        ? {
            places: initialPlaces,
            total: initialPlaces.length,
          }
        : {
            places: [],
            total: 0,
          },
      revalidateOnFocus: false,
    }
  );

  const {
    data: externalPlacesData,
    isLoading: isExternalPlacesLoading,
  } = useSWR<ExternalPlacesApiResponse>(
    externalPlacesApiUrl,
    fetcher,
    {
      fallbackData: {
        places: [],
        total: 0,
      },
      revalidateOnFocus: false,
    }
  );
  
  const isLoading = isPlacesLoading || isExternalPlacesLoading;
  
  const places = useMemo<ExternalPlace[]>(() => {
    const userPlaces = placesData?.places ?? initialPlaces;
    const externalPlaces = externalPlacesData?.places ?? [];
  
    return [...userPlaces, ...externalPlaces];
  }, [placesData?.places, externalPlacesData?.places, initialPlaces]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setVisibleCount(20);
  }, [queryString]);

  useEffect(() => {
    if (!selectedPlaceId) return;

    const el = itemRefs.current[selectedPlaceId];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedPlaceId, viewMode]);

  function handleApply(next: SearchFilterValue) {
    const params = new URLSearchParams();

    if (next.keyword.trim()) {
      params.set("keyword", next.keyword.trim());
    }

    if (next.source && next.source !== "all") {
      params.set("source", next.source);
    }

    next.tagIds.forEach((id) => params.append("tags", id));
    next.facilityIds.forEach((id) => params.append("facilities", id));

    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }

  function handleClear() {
    router.push(pathname, { scroll: false });
  }

  function isPlaceFavorited(place: ExternalPlace) {
    if (!userId) return false;
    return place.favorites?.some((favorite) => favorite.userId === userId) ?? false;
  }

  function updatePlaceFavoriteState(
    currentPlaces: Place[],
    placeId: string,
    shouldFavorite: boolean
  ): Place[] {
    return currentPlaces.map((place) => {
      if (place.id !== placeId) return place;

      const existingFavorites = place.favorites ?? [];
      const alreadyFavorited = existingFavorites.some(
        (favorite) => favorite.userId === userId
      );

      if (shouldFavorite && !alreadyFavorited) {
        return {
          ...place,
          favorites: [
            ...existingFavorites,
            {
              id: `temp-${placeId}-${userId}`,
              userId,
              placeId,
            },
          ],
        };
      }

      if (!shouldFavorite && alreadyFavorited) {
        return {
          ...place,
          favorites: existingFavorites.filter(
            (favorite) => favorite.userId !== userId
          ),
        };
      }

      return place;
    });
  }

  async function handleToggleFavorite(placeId: string) {
    if (!isLoggedIn || !userId || isFavoriteSubmitting) return;
  
    const targetPlace = places.find((place) => place.id === placeId);
    if (!targetPlace) return;
  
    if ("sourceType" in targetPlace && targetPlace.sourceType) {
      return;
    }
  
    const shouldFavorite = !isPlaceFavorited(targetPlace);
    setIsFavoriteSubmitting(true);
  
    try {
      await mutate(
        async (current) => {
          const res = await fetch("/api/favorites", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ placeId }),
          });
  
          if (!res.ok) {
            throw new Error("Failed to toggle favorite");
          }
  
          await res.json();
  
          return current ?? {
            places: placesData?.places ?? initialPlaces,
            total: (placesData?.places ?? initialPlaces).length,
          };
        },
        {
          optimisticData: (current) => {
            const currentPlaces = current?.places ?? placesData?.places ?? initialPlaces;
  
            return {
              places: updatePlaceFavoriteState(
                currentPlaces,
                placeId,
                shouldFavorite
              ),
              total: current?.total ?? currentPlaces.length,
            };
          },
          rollbackOnError: true,
          revalidate: true,
        }
      );
    } catch (error) {
      console.error("toggle favorite error:", error);
    } finally {
      setIsFavoriteSubmitting(false);
    }
  }

  function handleCreated(newPlace: Place) {
    mutate(
      (current) => {
        const currentPlaces = current?.places ?? places;
        return {
          places: [newPlace, ...currentPlaces],
          total: (current?.total ?? currentPlaces.length) + 1,
        };
      },
      { revalidate: false }
    );
  
    setSelectedPlaceId(newPlace.id);
    onCloseCreateModal();
    setViewMode("list");
  }

  const filteredPlaces = useMemo(() => {
    if (!showFavoritesOnly) return places;
    if (!userId) return [];
    return places.filter((place) =>
      place.favorites?.some((favorite) => favorite.userId === userId)
    );
  }, [places, showFavoritesOnly, userId]);

  useEffect(() => {
    if (!selectedPlaceId) return;

    const stillExists = filteredPlaces.some((place) => place.id === selectedPlaceId);
    if (!stillExists) {
      setSelectedPlaceId(null);
    }
  }, [filteredPlaces, selectedPlaceId]);

  const displayPlaces = useMemo(() => {
    return filteredPlaces.slice(0, visibleCount);
  }, [filteredPlaces, visibleCount]);

  if (status === "loading") return null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sticky top-0 z-[900] border-b border-[var(--color-border)] bg-[var(--color-bg-page)]/88 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 pt-4 pb-3">
          <SearchFilterBar
            tags={tags}
            facilities={facilities}
            value={filters}
            onApply={handleApply}
            onClear={handleClear}
            onOpenChange={onFilterOpenChange}
            compact
          />

          <div className="mt-3 flex items-center justify-between">
            <p className={`${ui.caption} ${ui.secondary}`}>
              {isLoading ? "搜尋中..." : `共 ${filteredPlaces.length} 筆結果`}
            </p>
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden dark:bg-[#1F1A17]">
        {(() => {
          const handleClearFavorite = () => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("favorite");
            const nextQuery = params.toString();
            router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
              scroll: false,
            });
          };

          const EmptyState = ({ overlay = false }: { overlay?: boolean }) => (
            <div
              className={
                overlay
                  ? "pointer-events-none absolute inset-0 z-[700] flex items-center justify-center p-6"
                  : "flex h-full items-center justify-center p-6 text-center"
              }
            >
              <div
                className={
                  overlay
                    ? "pointer-events-auto max-w-xs rounded-3xl border border-brand-line bg-white/92 px-5 py-4 text-center shadow-soft backdrop-blur dark:border-[#4A3F39] dark:bg-[#2A2421]"
                    : "max-w-xs text-center"
                }
              >
                <p className="text-sm font-medium text-brand-ink dark:text-white">
                  {showFavoritesOnly
                    ? "你還沒有收藏任何地點 🤍"
                    : "目前沒有符合條件的地點 👀"}
                </p>

                <p className="mt-2 text-xs leading-6 text-brand-softInk dark:text-[#CBBDB2]">
                  {showFavoritesOnly
                    ? "先去逛逛地點，看到喜歡的再按愛心收藏吧。"
                    : "可以試試放寬搜尋條件，或切回清單模式看看。"}
                </p>

                {showFavoritesOnly && (
                  <button
                    type="button"
                    onClick={handleClearFavorite}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-brand-peach px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                  >
                    去看看全部地點
                  </button>
                )}
              </div>
            </div>
          );

          const isEmpty = !isLoading && filteredPlaces.length === 0;

          return viewMode === "list" ? (
            <div className="h-full overflow-y-auto pb-24 animate-fade-in">
              {isEmpty ? (
                <EmptyState />
              ) : (
                <>
                  <PlaceList
                    places={displayPlaces}
                    selectedPlaceId={selectedPlaceId}
                    hoveredPlaceId={hoveredPlaceId}
                    onSelect={setSelectedPlaceId}
                    onHover={setHoveredPlaceId}
                    itemRefs={itemRefs}
                    userId={userId}
                    onToggleFavorite={handleToggleFavorite}
                  />

                  {filteredPlaces.length > visibleCount && (
                    <div className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 20)}
                        // className="text-sm font-medium text-brand-softInk transition hover:text-brand-ink dark:text-white/70 dark:hover:text-white"
                        className={`${ui.buttonBase} ${ui.buttonSm} ${ui.buttonGhost}`}
                      >
                        顯示更多（剩餘 {filteredPlaces.length - visibleCount}）
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="relative h-full w-full animate-fade-in">
              <Map
                userId={userId}
                places={displayPlaces}
                selectedPlaceId={selectedPlaceId}
                hoveredPlaceId={hoveredPlaceId}
                onSelect={setSelectedPlaceId}
                onToggleFavorite={handleToggleFavorite}
              />

              {isEmpty && <EmptyState overlay />}
            </div>
          );
        })()}
      </div>

      <div className={`pointer-events-none fixed inset-x-0 bottom-6 z-[800] flex justify-center transition-all duration-200 ${
        shouldHideFloatingToggle
          ? "translate-y-4 opacity-0"
          : "translate-y-0 opacity-100"
      }`}>
        <div className={`pointer-events-auto relative flex items-center rounded-full border border-brand-line bg-white/90 p-1 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-[#2A2421]/90 ${
          shouldHideFloatingToggle ? "pointer-events-none" : ""
        }`}>
          <div
            className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-brand-lavender transition-all duration-300 ${
              viewMode === "list" ? "left-1" : "left-[calc(50%-4px)]"
            }`}
          />

          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`relative z-10 flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition cursor-pointer ${
              viewMode === "list"
                ? "text-brand-ink"
                : "text-brand-softInk dark:text-[#CBBDB2]"
            }`}
          >
            <List size={20} />
            <span>清單</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`relative z-10 flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition cursor-pointer ${
              viewMode === "map"
                ? "text-brand-ink"
                : "text-brand-softInk dark:text-[#CBBDB2]"
            }`}
          >
            <MapPinned size={20} />
            <span>地圖</span>
          </button>
        </div>
      </div>

      {mounted &&
        showCreateModal &&
        createPortal(
          <div className="fixed inset-0 z-[1300]">
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              onClick={onCloseCreateModal}
            />

            <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-6">
              <div className="relative max-h-[88vh] w-full overflow-hidden rounded-t-[2rem] bg-white shadow-2xl md:max-h-[85vh] md:max-w-2xl md:rounded-[2rem] dark:bg-[#2A2421]">
                <div className="flex justify-center pt-3 md:hidden">
                  <div className="h-1.5 w-14 rounded-full bg-neutral-200" />
                </div>

                <div className="flex items-center justify-between px-5 pt-4 pb-3 md:px-6 md:pt-5">
                  <div>
                    <h2 className="text-xl font-bold text-brand-ink md:text-2xl dark:text-white">
                      新增地點
                    </h2>
                    <p className="mt-1 text-sm text-brand-softInk dark:text-[#CBBDB2]">
                      分享一個適合親子的好地方 ✨
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onCloseCreateModal}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-line bg-white text-brand-softInk transition hover:bg-brand-sand dark:border-white/10 dark:bg-[#2A2421]"
                  >
                    ✕
                  </button>
                </div>

                <div className="max-h-[calc(88vh-140px)] overflow-y-auto px-5 pb-5 md:max-h-[calc(85vh-150px)] md:px-6 md:pb-6">
                  <AddPlaceForm 
                    onCreated={handleCreated}
                    onCancel={onCloseCreateModal} 
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}