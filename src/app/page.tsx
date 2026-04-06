"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PlaceList from "../components/PlaceList";
import LoginButton from "../components/LoginButton"
import AddPlaceForm from "../components/AddPlaceForm";
import PlacesClient from "../components/PlaceClient";
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
    <section className="min-h-screen bg-[#fffaf3] flex justify-center">
      <div className="w-full max-w-[720px] flex flex-col">
        
        <h1 className="text-2xl font-semibold px-4 py-3 border-b bg-white/80 backdrop-blur sticky top-0 z-10">
          KiddoSpot
        </h1>

        <div className="flex-1">
          <PlacesClient places={places} />
        </div>

      </div>
    </section>
  )
}