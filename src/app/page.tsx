"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PlaceList from "../components/PlaceList";
import LoginButton from "../components/LoginButton"
import AddPlaceForm from "../components/AddPlaceForm";
import { Place } from "../types/place";
import { useSession } from "next-auth/react";

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
});
export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const { data: session } = useSession();
  console.log(session)
  
  const handleCreated = (newPlace: Place) => {
    setPlaces((prev) => [...prev, newPlace]);
    setSelectedPlaceId(newPlace.id);
  };

  useEffect(() => {
    fetch("/api/places")
      .then((res) => res.json())
      .then((data) => {
        setPlaces(data)
      });
  }, []);

  return (
    <>
      <section className="flex items-center justify-center">
        <h1 className="text-4xl font-bold">
          KiddoSpot
        </h1>

        <LoginButton />
      </section>
      <main className="h-screen flex">
        <div className="w-1/3 border-r">
          <AddPlaceForm onCreated={handleCreated} />
          <PlaceList
            places={places}
            selectedPlaceId={selectedPlaceId}
            hoveredPlaceId={hoveredPlaceId}
            onSelect={setSelectedPlaceId}
            onHover={setHoveredPlaceId}
          />

        </div>

        <div className="flex-1">
          <Map
            userId={session?.user?.id}
            places={places}
            setPlaces={setPlaces}
            selectedPlaceId={selectedPlaceId}
            hoveredPlaceId={hoveredPlaceId}
            onSelect={setSelectedPlaceId}
          />
        </div>
      </main>
    </>
  )
}