"use client";

import { useState } from "react";

export default function SearchForm() {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestCount, setGuestCount] = useState(2);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    const query = new URLSearchParams({
      checkInDate,
      checkOutDate,
      guestCount: guestCount.toString(),
    });

    window.location.href = `/?${query.toString()}`;
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-xl shadow-lg p-6 space-y-4"
    >
      <h2 className="text-2xl font-semibold">
        Search Available Rooms
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-medium">
            Check-In
          </label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Check-Out
          </label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Guests
          </label>
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

      <button
        type="submit"
        className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90"
      >
        Search Rooms
      </button>
    </form>
  );
}