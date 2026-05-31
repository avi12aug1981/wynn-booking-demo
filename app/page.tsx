import SearchForm from "./components/SearchForm";
import RoomSearchResults from "./components/RoomSearchResults";
import SearchPageRefreshScript from "./components/SearchPageRefreshScript";
import { searchAvailableRooms } from "@/app/lib/services/room-search-service";
import type { RoomSearchResult } from "@/app/types/room";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: string;
    petsAllowed?: string;
    nonSmoking?: string;
    minRating?: string;
    bookingError?: string;
    unavailableRoomId?: string;
  }>;
};

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

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  const rooms = await getRooms(
    params.checkInDate,
    params.checkOutDate,
    params.guestCount,
    params.petsAllowed,
    params.nonSmoking,
    params.minRating
  );

  const hasSearched =
    params.checkInDate && params.checkOutDate && params.guestCount;

  const unavailableRoomId = params.unavailableRoomId
    ? Number(params.unavailableRoomId)
    : undefined;

  const bookingErrorMessage =
    params.bookingError === "room-not-found"
      ? "The selected room is no longer available. Please search again."
      : params.bookingError === "room-unavailable"
        ? unavailableRoomId
          ? `Room #${unavailableRoomId} is no longer available for the selected dates. Choose another room or change your dates.`
          : "This room is no longer available for the selected dates. Choose another room or change your dates."
      : params.bookingError === "invalid-selection"
        ? "Your booking link is invalid. Use future check-in/check-out dates and try again."
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
          defaultCheckInDate={params.checkInDate}
          defaultCheckOutDate={params.checkOutDate}
          defaultGuestCount={params.guestCount}
          defaultPetsAllowed={params.petsAllowed === "true"}
          defaultNonSmoking={params.nonSmoking === "true"}
          defaultMinRating={params.minRating}
        />
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        {hasSearched && (
          <RoomSearchResults
            initialRooms={rooms}
            checkInDate={params.checkInDate!}
            checkOutDate={params.checkOutDate!}
            guestCount={params.guestCount!}
            petsAllowed={params.petsAllowed}
            nonSmoking={params.nonSmoking}
            minRating={params.minRating}
          />
        )}
      </section>
    </main>
  );
}