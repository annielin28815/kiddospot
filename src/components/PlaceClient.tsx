"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import PlaceList from "../components/PlaceList";
import LoginButton from "../components/LoginButton"
import AddPlaceForm from "../components/AddPlaceForm";
import ModalPortal from "./ModalPortal";
import { Place } from "../types/place";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function PlacesClient({ places }) {
  const [clientPlaces, setClientPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: session, status } = useSession();
  const userId = status === "authenticated" ? session.user.id : "";
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    setClientPlaces(places);
  }, [places]);

  const handleCreated = (newPlace: Place) => {
    setClientPlaces((prev) => [...prev, newPlace]);
    setSelectedPlaceId(newPlace.id);
  };

  const filteredPlaces = clientPlaces.filter((p) => {
    if (!showFavoritesOnly) return true;
    if (!userId) return false;
    return p.favorites?.some((f) => f.userId === userId);
  });

  if(status === "loading") return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-center gap-3 p-3 border-b">
        <LoginButton />

        {isLoggedIn &&
          <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={() => setShowCreateModal(true)}
          >
            + 新增地點
          </button>
        }
      </div>

      <div className="flex flex-1 overflow-hidden">
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
      </div>

      {showCreateModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
            <div className="bg-white p-4 rounded w-[400px]">
              <h2 className="text-lg font-bold mb-2">新增地點</h2>

              <AddPlaceForm
                onCreated={(place) => {
                  handleCreated(place);
                  setShowCreateModal(false);
                }}
              />

              <button onClick={() => setShowCreateModal(false)}>
                關閉
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}