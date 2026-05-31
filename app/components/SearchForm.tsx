"use client";

import { useState } from "react";
import { todayDateInputValue } from "@/app/lib/utils/date";
import AppButton from "./AppButton";

type SearchFormProps = {
  defaultCheckInDate?: string;
  defaultCheckOutDate?: string;
  defaultGuestCount?: string;
  defaultPetsAllowed?: boolean;
  defaultNonSmoking?: boolean;
  defaultMinRating?: string;
};

export default function SearchForm({
  defaultCheckInDate = "",
  defaultCheckOutDate = "",
  defaultGuestCount = "2",
  defaultPetsAllowed = false,
  defaultNonSmoking = false,
  defaultMinRating = "",
}: SearchFormProps) {
  const today = todayDateInputValue();
  const [checkInDate, setCheckInDate] = useState(defaultCheckInDate);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOutDate);
  const [guestCount, setGuestCount] = useState(Number(defaultGuestCount));
  const [petsAllowed, setPetsAllowed] = useState(defaultPetsAllowed);
  const [nonSmoking, setNonSmoking] = useState(defaultNonSmoking);
  const [minRating, setMinRating] = useState(defaultMinRating);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSearching(true);

    const query = new URLSearchParams({
      checkInDate,
      checkOutDate,
      guestCount: guestCount.toString(),
    });

    if (petsAllowed) query.set("petsAllowed", "true");
    if (nonSmoking) query.set("nonSmoking", "true");
    if (minRating) query.set("minRating", minRating);

    window.location.href = `/?${query.toString()}`;
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-xl shadow-lg p-6 space-y-5"
    >
      <h2 className="text-2xl font-semibold">Search Available Rooms</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-medium">Check-In</label>
          <input
            type="date"
            value={checkInDate}
            min={today}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Check-Out</label>
          <input
            type="date"
            value={checkOutDate}
            min={checkInDate || today}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Guests</label>
          <input
            type="number"
            min="1"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={petsAllowed}
            onChange={(e) => setPetsAllowed(e.target.checked)}
          />
          Pets allowed
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={nonSmoking}
            onChange={(e) => setNonSmoking(e.target.checked)}
          />
          Non-smoking only
        </label>

        <div>
          <label className="block mb-1 text-sm font-medium">Minimum Rating</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Any rating</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
            <option value="4.8">4.8+</option>
          </select>
        </div>
      </div>

      <AppButton
        type="submit"
        fullWidth
        loading={isSearching}
        loadingText="Searching"
      >
        Search Rooms
      </AppButton>
    </form>
  );
}