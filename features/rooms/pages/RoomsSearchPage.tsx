import SearchForm from "@/features/rooms/components/SearchForm";
import RoomSearchResults from "@/features/rooms/components/RoomSearchResults";
import SearchPageRefreshScript from "@/features/rooms/components/SearchPageRefreshScript";
import { searchAvailableRooms } from "@/features/rooms/services/room-search-service";
import type { RoomSearchResult } from "@/app/types/room";
import { Messages } from "@/app/constants/messages";

export const dynamic = "force-dynamic";

import type { PageRouteContext } from "@/features/app-router/route-types";
import { BookingErrors } from "@/app/constants/booking-errors";

type RoomsSearchPageProps = PageRouteContext;

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getRooms(
  checkInDate?: string,
  checkOutDate?: string,
  guestCount?: string,
  petsAllowed?: string,
  nonSmoking?: string,
  minRating?: string
): Promise<RoomSearchResult[]> {
  if (!checkInDate || !checkOutDate || !guestCount) {
    return [];
  }

  const parsedGuestCount = Number(guestCount);

  if (!Number.isInteger(parsedGuestCount) || parsedGuestCount < 1) {
    return [];
  }

  return searchAvailableRooms({
    checkInDate,
    checkOutDate,
    guestCount: parsedGuestCount,
    petsAllowed: petsAllowed === "true",
    nonSmoking: nonSmoking === "true",
    minRating: minRating ? Number(minRating) : undefined,
  });
}

export default async function RoomsSearchPage({
  searchParams,
}: RoomsSearchPageProps) {
  const params = searchParams;
  const checkInDate = getSingleQueryValue(params.checkInDate);
  const checkOutDate = getSingleQueryValue(params.checkOutDate);
  const guestCount = getSingleQueryValue(params.guestCount);
  const petsAllowed = getSingleQueryValue(params.petsAllowed);
  const nonSmoking = getSingleQueryValue(params.nonSmoking);
  const minRating = getSingleQueryValue(params.minRating);
  const bookingError = getSingleQueryValue(params.bookingError);
  const unavailableRoomIdValue = getSingleQueryValue(params.unavailableRoomId);


  const rooms = await getRooms(
    checkInDate,
checkOutDate,
guestCount,
petsAllowed,
nonSmoking,
minRating 
  );

  const hasSearched = checkInDate && checkOutDate && guestCount;

const unavailableRoomId = unavailableRoomIdValue
  ? Number(unavailableRoomIdValue)
  : undefined;

const bookingErrorMessage =
  bookingError === BookingErrors.RoomNotFound
    ? BookingErrors.RoomNotFound
    : bookingError === BookingErrors.RoomUnavailable
      ? unavailableRoomId
        ? Messages.SearchPage.RoomUnavailableForDatesWithId.replace("{roomId}", unavailableRoomId.toString())
        : Messages.SearchPage.RoomUnavailableForDates
    : bookingError === BookingErrors.InvalidSelection
      ? Messages.SearchPage.InvalidBookingSelection
      : null;

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <SearchPageRefreshScript hasSearch={Boolean(hasSearched)} />
      <section className="bg-[#3a2418] text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-sm">
            Wynn Las Vegas
          </p>

          <h1 className="font-serif text-3xl mt-4">
            Experience Luxury Accommodations
          </h1>

          <p className="text-stone-200 mt-3 max-w-2xl">
            Search available rooms, review premium amenities, and complete your
            reservation.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        {bookingErrorMessage && (
          <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {bookingErrorMessage}
          </div>
        )}

<SearchForm
  defaultCheckInDate={checkInDate}
  defaultCheckOutDate={checkOutDate}
  defaultGuestCount={guestCount}
  defaultPetsAllowed={petsAllowed === "true"}
  defaultNonSmoking={nonSmoking === "true"}
  defaultMinRating={minRating}
/>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        {hasSearched && (
          <RoomSearchResults
          initialRooms={rooms}
          checkInDate={checkInDate!}
          checkOutDate={checkOutDate!}
          guestCount={guestCount!}
          petsAllowed={petsAllowed}
          nonSmoking={nonSmoking}
          minRating={minRating}
        />
        )}
      </section>
    </main>
  );
}