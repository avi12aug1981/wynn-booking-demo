"use client";

import { useCallback, useEffect, useState } from "react";
import RoomCard from "./RoomCard";
import type { RoomSearchResult } from "@/app/types/room";

type RoomSearchResultsProps = {
  initialRooms: RoomSearchResult[];
  checkInDate: string;
  checkOutDate: string;
  guestCount: string;
  petsAllowed?: string;
  nonSmoking?: string;
  minRating?: string;
};

type RoomsApiResponse = {
  success?: boolean;
  data?: {
    rooms?: RoomSearchResult[];
  };
  rooms?: RoomSearchResult[];
};

export default function RoomSearchResults({
  initialRooms,
  checkInDate,
  checkOutDate,
  guestCount,
  petsAllowed,
  nonSmoking,
  minRating,
}: RoomSearchResultsProps) {
  const [rooms, setRooms] = useState(initialRooms);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");

  const refreshRooms = useCallback(async () => {
    setIsRefreshing(true);

    const query = new URLSearchParams({
      checkInDate,
      checkOutDate,
      guestCount,
    });

    if (petsAllowed) query.set("petsAllowed", petsAllowed);
    if (nonSmoking) query.set("nonSmoking", nonSmoking);
    if (minRating) query.set("minRating", minRating);

    try {
      const response = await fetch(`/api/rooms?${query.toString()}`, {
        cache: "no-store",
      });

      if (response.ok) {
        const data = (await response.json()) as RoomsApiResponse;

        setRooms(data.data?.rooms ?? data.rooms ?? []);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [checkInDate, checkOutDate, guestCount, minRating, nonSmoking, petsAllowed]);

  useEffect(() => {
    void refreshRooms();
  }, [refreshRooms]);

  function handleUnavailable(message: string) {
    setBannerMessage(message);
    void refreshRooms();
  }

  return (
    <>
      {bannerMessage && (
        <div className="mb-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          {bannerMessage}
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-serif text-3xl text-gray-900">Available Rooms</h2>

        <p className="text-gray-600 mt-1">
          {isRefreshing
            ? "Checking latest availability..."
            : `${rooms.length} room option${
                rooms.length === 1 ? "" : "s"
              } found for your stay.`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            guestCount={guestCount}
            onUnavailable={handleUnavailable}
          />
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="bg-white border rounded-sm p-8 text-center">
          <h3 className="font-serif text-2xl">No rooms available</h3>

          <p className="text-gray-600 mt-2">
            Please adjust your dates, guest count, or filters and try again.
          </p>
        </div>
      )}
    </>
  );
}