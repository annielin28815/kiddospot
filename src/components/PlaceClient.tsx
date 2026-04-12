"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import { Heart, List, MapPinPlus, MapPinned } from "lucide-react";

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

type SearchFilterValue = {
  keyword: string;
  tagIds: string[];
  facilityIds: string[];
};

type PlacesApiResponse = {
  places: Place[];
  total: number;
};

type PlacesClientProps = {
  initialPlaces: Place[];
  tags: FilterOption[];
  facilities: FilterOption[];
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
}: PlacesClientProps) {
  const { data: session, status } = useSession();

  const userId = status === "authenticated" ? session.user.id : "";
  const isLoggedIn = status === "authenticated";

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const keyword = searchParams.get("keyword") || "";
  const tagIds = searchParams.getAll("tags");
  const facilityIds = searchParams.getAll("facilities");

  const filters: SearchFilterValue = {
    keyword,
    tagIds,
    facilityIds,
  };

  const queryString = searchParams.toString();
  const apiUrl = queryString ? `/api/places?${queryString}` : `/api/places`;

  const { data, isLoading, mutate } = useSWR<PlacesApiResponse>(apiUrl, fetcher, {
    fallbackData: {
      places: initialPlaces,
      total: initialPlaces.length,
    },
    revalidateOnFocus: false,
  });

  const places = data?.places ?? initialPlaces;

  useEffect(() => {
    setVisibleCount(20);
  }, [queryString, showFavoritesOnly]);

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

  function isPlaceFavorited(place: Place) {
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
            places,
            total: places.length,
          };
        },
        {
          optimisticData: (current) => {
            const currentPlaces = current?.places ?? places;

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
    setShowCreateModal(false);
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
      <SearchFilterBar
        tags={tags}
        facilities={facilities}
        value={filters}
        onApply={handleApply}
        onClear={handleClear}
      />

      <div className="flex items-center justify-between border-b border-brand-line bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-brand-peach px-4 py-2 text-sm font-medium text-brand-ink shadow-soft transition hover:scale-[1.02] cursor-pointer"
              onClick={() => setShowCreateModal(true)}
            >
              <MapPinPlus size={20} />
              <span>新增</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-soft transition cursor-pointer ${
              showFavoritesOnly
                ? "border-brand-lavender bg-brand-lavender text-brand-ink"
                : "border-brand-line bg-white text-brand-softInk hover:bg-brand-cream"
            }`}
          >
            <Heart
              size={18}
              className={showFavoritesOnly ? "fill-current" : ""}
            />
            <span>只看收藏</span>
          </button>
        </div>

        <div className="text-xs text-brand-softInk dark:text-white/60">
          {isLoading ? "搜尋中..." : `共 ${filteredPlaces.length} 筆`}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden dark:bg-[#1F1A17]">
        {viewMode === "list" ? (
          <div className="h-full overflow-y-auto pb-24 animate-fade-in">
            {!isLoading && filteredPlaces.length === 0 ? 
              <div className="h-full flex items-center justify-center text-center text-sm text-brand-softInk dark:text-white/70">
                找不到符合條件的地點，試試看放寬搜尋條件吧 👀
              </div>
              :
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
            }

            {filteredPlaces.length > visibleCount && (
              <div className="p-4 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  className="text-sm font-medium text-brand-softInk transition hover:text-brand-ink dark:text-white/70 dark:hover:text-white"
                >
                  顯示更多（剩餘 {filteredPlaces.length - visibleCount}）
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full w-full animate-fade-in">
            <Map
              userId={userId}
              places={displayPlaces}
              selectedPlaceId={selectedPlaceId}
              hoveredPlaceId={hoveredPlaceId}
              onSelect={setSelectedPlaceId}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[1200] flex justify-center">
        <div className="pointer-events-auto relative flex items-center rounded-full border border-brand-line bg-white/90 p-1 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-[#2A2421]/90">
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
                : "text-brand-softInk dark:text-white/70"
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
                : "text-brand-softInk dark:text-white/70"
            }`}
          >
            <MapPinned size={20} />
            <span>地圖</span>
          </button>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-brand-cream shadow-soft dark:bg-[#2A2421]">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 z-10 text-xl text-brand-softInk hover:text-brand-ink dark:text-white/70 dark:hover:text-white"
            >
              ✕
            </button>

            <div className="m-4 overflow-y-auto">
              <AddPlaceForm onCreated={handleCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}