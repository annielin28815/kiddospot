"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import PlaceList from "../components/PlaceList";
import AddPlaceForm from "../components/AddPlaceForm";
import { Place } from "../types/place";
import { MapPinPlus, List, MapPinned } from "lucide-react";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function PlacesClient({ places }) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [visibleCount, setVisibleCount] = useState(20);
  const [clientPlaces, setClientPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: session, status } = useSession();
  const userId = status === "authenticated" ? session.user.id : "";
  const isLoggedIn = status === "authenticated";
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setClientPlaces(places);
  }, [places]);

  useEffect(() => {
    if (!selectedPlaceId) return;
  
    const el = itemRefs.current[selectedPlaceId];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedPlaceId]);

  const handleCreated = (newPlace: Place) => {
    setClientPlaces((prev) => [...prev, newPlace]);
    setSelectedPlaceId(newPlace.id);
  };

  if(clientPlaces === undefined || status === "loading") return null;
  // console.log(clientPlaces)
  const filteredPlaces = clientPlaces.filter((p) => {
    if (!showFavoritesOnly) return true;
    if (!userId) return false;
    return p.favorites?.some((f) => f.userId === userId);
  });


  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-brand-line bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
        
  
        {isLoggedIn && (
          <button
            className="flex justify-between items-center gap-2 rounded-full bg-brand-peach px-4 py-2 text-sm font-medium text-brand-ink shadow-soft transition hover:scale-[1.02]"
            onClick={() => setShowCreateModal(true)}
          >
            <MapPinPlus size={20} /> <span>新增</span>
          </button>
        )}
      </div>
  
      <div className="relative flex-1 min-h-0 overflow-hidden dark:bg-[#1F1A17]">
        {viewMode === "list" ? (
          <div className="h-full overflow-y-auto pb-24 animate-fade-in">
            <PlaceList
              places={filteredPlaces.slice(0, visibleCount)}
              selectedPlaceId={selectedPlaceId}
              hoveredPlaceId={hoveredPlaceId}
              onSelect={setSelectedPlaceId}
              onHover={setHoveredPlaceId}
            />

            {filteredPlaces.length > visibleCount && (
              <div className="p-4 text-center">
                <button
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
              places={filteredPlaces.slice(0, visibleCount)}
              setPlaces={setClientPlaces}
              selectedPlaceId={selectedPlaceId}
              hoveredPlaceId={hoveredPlaceId}
              onSelect={setSelectedPlaceId}
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
            className={`relative z-10 rounded-full flex justify-between items-center gap-2 px-6 py-2 text-sm font-medium transition ${
              viewMode === "list"
                ? "text-brand-ink"
                : "text-brand-softInk dark:text-white/70"
            }`}
          >
            <List size={20} /><span>清單</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`relative z-10 rounded-full flex justify-between items-center gap-2 px-6 py-2 text-sm font-medium transition ${
              viewMode === "map"
                ? "text-brand-ink"
                : "text-brand-softInk dark:text-white/70"
            }`}
          >
            <MapPinned size={20} /><span>地圖</span>
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
              <AddPlaceForm
                onCreated={(place) => {
                  handleCreated(place);
                  setShowCreateModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}