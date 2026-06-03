"use client";

import { useEffect, useState } from "react";
import { Messages } from "@/app/constants/messages";
import {
  addDaysToDateInputValue,
  areStayDatesValid,
  clampStayDateDefaults,
  isBeforeToday,
  isCheckOutAfterCheckIn,
  todayDateInputValue,
} from "@/app/lib/utils/date";
import AppButton from "@/components/ui/atoms/AppButton";

type SearchFormProps = {
  /** Mirrors URL search params so the calendar always matches the address bar. */
  defaultCheckInDate?: string;
  defaultCheckOutDate?: string;
  defaultGuestCount?: string;
  defaultPetsAllowed?: boolean;
  defaultNonSmoking?: boolean;
  defaultMinRating?: string;
};

function formDatesFromUrl(checkIn?: string, checkOut?: string) {
  if (checkIn && checkOut) {
    return { checkInDate: checkIn, checkOutDate: checkOut };
  }

  if (checkIn || checkOut) {
    return {
      checkInDate: checkIn ?? "",
      checkOutDate: checkOut ?? "",
    };
  }

  return clampStayDateDefaults();
}

function formStateFromProps(props: SearchFormProps) {
  const dates = formDatesFromUrl(
    props.defaultCheckInDate,
    props.defaultCheckOutDate
  );
  const parsedGuestCount = Number(props.defaultGuestCount ?? "2");

  return {
    checkInDate: dates.checkInDate,
    checkOutDate: dates.checkOutDate,
    guestCount:
      Number.isInteger(parsedGuestCount) && parsedGuestCount >= 1
        ? parsedGuestCount
        : 2,
    petsAllowed: props.defaultPetsAllowed ?? false,
    nonSmoking: props.defaultNonSmoking ?? false,
    minRating: props.defaultMinRating ?? "",
  };
}

export default function SearchForm(props: SearchFormProps) {
  const {
    defaultCheckInDate = "",
    defaultCheckOutDate = "",
    defaultGuestCount = "2",
    defaultPetsAllowed = false,
    defaultNonSmoking = false,
    defaultMinRating = "",
  } = props;

  const today = todayDateInputValue();
  const initial = formStateFromProps(props);

  const [checkInDate, setCheckInDate] = useState(initial.checkInDate);
  const [checkOutDate, setCheckOutDate] = useState(initial.checkOutDate);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(initial.guestCount);
  const [petsAllowed, setPetsAllowed] = useState(initial.petsAllowed);
  const [nonSmoking, setNonSmoking] = useState(initial.nonSmoking);
  const [minRating, setMinRating] = useState(initial.minRating);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const next = formStateFromProps(props);
    setCheckInDate(next.checkInDate);
    setCheckOutDate(next.checkOutDate);
    setGuestCount(next.guestCount);
    setPetsAllowed(next.petsAllowed);
    setNonSmoking(next.nonSmoking);
    setMinRating(next.minRating);
    setValidationError(null);
  }, [
    defaultCheckInDate,
    defaultCheckOutDate,
    defaultGuestCount,
    defaultPetsAllowed,
    defaultNonSmoking,
    defaultMinRating,
  ]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    if (!areStayDatesValid(checkInDate, checkOutDate)) {
      setValidationError(
        isBeforeToday(checkInDate)
          ? Messages.Booking.CheckInDateCannotBePast
          : Messages.Booking.CheckoutMustBeAfterCheckin
      );
      return;
    }

    setIsSearching(true);

    const query = new URLSearchParams({
      checkInDate,
      checkOutDate,
      guestCount: guestCount.toString(),
    });

    if (petsAllowed) query.set("petsAllowed", "true");
    if (nonSmoking) query.set("nonSmoking", "true");
    if (minRating) query.set("minRating", minRating);

    window.location.href = `/search?${query.toString()}`;
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-xl shadow-lg p-6 space-y-5"
    >
      <h2 className="text-2xl font-semibold">Search Available Rooms</h2>

      {validationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-medium">Check-In</label>
          <input
            type="date"
            value={checkInDate}
            min={today}
            onChange={(e) => {
              const nextCheckIn = e.target.value;
              setCheckInDate(nextCheckIn);

              if (!isCheckOutAfterCheckIn(nextCheckIn, checkOutDate)) {
                setCheckOutDate(addDaysToDateInputValue(nextCheckIn, 2));
              }
            }}
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