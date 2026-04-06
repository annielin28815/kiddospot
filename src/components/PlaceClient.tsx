"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import PlaceList from "../components/PlaceList";
import LoginButton from "../components/LoginButton"
import AddPlaceForm from "../components/AddPlaceForm";
import ModalPortal from "./ModalPortal";
import { Place } from "../types/place";

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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <LoginButton />

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <button
              className="px-3 py-1 rounded-full bg-[#b06000] text-white text-sm"
              onClick={() => setShowCreateModal(true)}
            >
              ＋新增
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {viewMode === "list" ? (
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              viewMode === "list" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="h-full overflow-y-auto pb-20">
              <PlaceList
                places={filteredPlaces.slice(0, visibleCount)}
                selectedPlaceId={selectedPlaceId}
                hoveredPlaceId={hoveredPlaceId}
                onSelect={setSelectedPlaceId}
                onHover={setHoveredPlaceId}
              />

              {/* 顯示更多 */}
              {filteredPlaces.length > visibleCount && (
                <div className="p-4 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 20)}
                    className="text-sm text-[#8a4b00]"
                  >
                    顯示更多（剩餘 {filteredPlaces.length - visibleCount}）
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              viewMode === "map" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
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
      {/* <div className="flex flex-1 overflow-hidden">
        <div className="w-[320px] border-r overflow-y-auto">
          <PlaceList
            places={filteredPlaces}
            selectedPlaceId={selectedPlaceId}
            hoveredPlaceId={hoveredPlaceId}
            onSelect={setSelectedPlaceId}
            onHover={setHoveredPlaceId}
          />
        </div>

        <div className="flex-1">
          <Map
            userId={userId}
            places={filteredPlaces}
            setPlaces={setClientPlaces}
            selectedPlaceId={selectedPlaceId}
            hoveredPlaceId={hoveredPlaceId}
            onSelect={setSelectedPlaceId}
          />
        </div>
      </div> */}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
        <div className="relative flex items-center bg-white/80 backdrop-blur-md border border-[#e5c9a8] shadow-md rounded-full p-1">

          {/* 滑動背景 */}
          <div
            className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-[#b06000] transition-all duration-300 ${
              viewMode === "list" ? "left-1" : "left-[calc(50%-4px)]"
            }`}
          />

          {/* 清單 */}
          <button
            onClick={() => setViewMode("list")}
            className={`relative z-10 px-6 py-2 text-sm rounded-full transition ${
              viewMode === "list"
                ? "text-white"
                : "text-[#8a4b00]"
            }`}
          >
            清單
          </button>

          {/* 地圖 */}
          <button
            onClick={() => setViewMode("map")}
            className={`relative z-10 px-6 py-2 text-sm rounded-full transition ${
              viewMode === "map"
                ? "text-white"
                : "text-[#8a4b00]"
            }`}
          >
            地圖
          </button>
        </div>
      </div>

      {showCreateModal && 
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg max-h-[90vh] flex flex-col">
            
            {/* 關閉 */}
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
            >
              ✕
            </button>

            {/* 內容可滾動 */}
            <div className="overflow-y-auto m-4">
              <AddPlaceForm
                onCreated={(place) => {
                  handleCreated(place);
                  setShowCreateModal(false);
                }}
              />
            </div>
          </div>
        </div>
      }

      {/* {showCreateModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
            <div className="relative bg-white rounded w-[400px] rounded-2xl shadow-md">
              <button
                type="button"
                onClick={()=>setShowCreateModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>

              <AddPlaceForm
                onCreated={(place) => {
                  handleCreated(place);
                  setShowCreateModal(false);
                }}
              />
            </div>
          </div>
        </ModalPortal>
      )} */}
    </div>
  );
}