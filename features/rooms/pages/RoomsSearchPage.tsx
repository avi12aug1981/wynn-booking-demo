import SearchForm from "@/features/rooms/components/SearchForm";
import RoomSearchResults from "@/features/rooms/components/RoomSearchResults";
import SearchPageRefreshScript from "@/features/rooms/components/SearchPageRefreshScript";
import { areStayDatesValid, clampStayDateDefaults } from "@/app/lib/utils/date";
import { searchRoomsDotNet } from "@/lib/api/dotnet-booking-client";
import type { RoomSearchResult } from "@/app/types/room";
import { Messages } from "@/app/constants/messages";
import { BookingErrors } from "@/app/constants/booking-errors";
import type { PageRouteContext } from "@/features/app-router/route-types";

export const dynamic = "force-dynamic";

type RoomsSearchPageProps = PageRouteContext;

// Catch-all gateway routes can provide query values as arrays.
// Feature pages normalize query values before applying business rules.
function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Search page is the availability entry point.
// Invalid or incomplete criteria intentionally return no rooms.
async function getRooms(
  checkInDate?: string,
  checkOutDate?: string,
  guestCount?: string,
  petsAllowed?: string,
  nonSmoking?: string,
  minRating?: string
): Promise<{ rooms: RoomSearchResult[]; loadError?: string }> {
  if (!checkInDate || !checkOutDate || !guestCount) {
    return { rooms: [] };
  }

  const parsedGuestCount = Number(guestCount);

  if (!Number.isInteger(parsedGuestCount) || parsedGuestCount < 1) {
    return { rooms: [] };
  }

  if (!areStayDatesValid(checkInDate, checkOutDate)) {
    return { rooms: [] };
  }

  try {
    const result = await searchRoomsDotNet({
      checkInDate,
      checkOutDate,
      guestCount: parsedGuestCount,
      petsAllowed: petsAllowed === "true",
      nonSmoking: nonSmoking === "true",
      minRating: minRating ? Number(minRating) : undefined,
    });

    if (!result.ok) {
      return {
        rooms: [],
        loadError: result.message ?? Messages.RoomSearch.SearchFailed,
      };
    }

    return { rooms: result.rooms };
  } catch {
    return { rooms: [], loadError: Messages.RoomSearch.SearchFailed };
  }
}

export default async function RoomsSearchPage({
  searchParams,
}: RoomsSearchPageProps) {
  const rawCheckInDate = getSingleQueryValue(searchParams.checkInDate);
  const rawCheckOutDate = getSingleQueryValue(searchParams.checkOutDate);
  const guestCount = getSingleQueryValue(searchParams.guestCount);

  const hasInvalidStayDates =
    Boolean(rawCheckInDate && rawCheckOutDate) &&
    !areStayDatesValid(rawCheckInDate!, rawCheckOutDate!);

  const clampedDates = clampStayDateDefaults(rawCheckInDate, rawCheckOutDate);
  const checkInDate =
    rawCheckInDate && !hasInvalidStayDates ? clampedDates.checkInDate : undefined;
  const checkOutDate =
    rawCheckOutDate && !hasInvalidStayDates
      ? clampedDates.checkOutDate
      : undefined;
  const petsAllowed = getSingleQueryValue(searchParams.petsAllowed);
  const nonSmoking = getSingleQueryValue(searchParams.nonSmoking);
  const minRating = getSingleQueryValue(searchParams.minRating);
  const bookingError = getSingleQueryValue(searchParams.bookingError);
  const unavailableRoomIdValue = getSingleQueryValue(searchParams.unavailableRoomId);

  const { rooms, loadError } = await getRooms(
    checkInDate,
    checkOutDate,
    guestCount,
    petsAllowed,
    nonSmoking,
    minRating
  );

  const hasSearched = checkInDate && checkOutDate && guestCount;

  const searchFormKey = [
    rawCheckInDate ?? "",
    rawCheckOutDate ?? "",
    guestCount ?? "",
    petsAllowed ?? "",
    nonSmoking ?? "",
    minRating ?? "",
    bookingError ?? "",
  ].join("|");

  const unavailableRoomId = unavailableRoomIdValue
    ? Number(unavailableRoomIdValue)
    : undefined;

  // Booking workflow error codes are converted to user-friendly messages here.
  const bookingErrorMessage =
    hasInvalidStayDates
      ? Messages.SearchPage.InvalidBookingSelection
      : bookingError === BookingErrors.RoomNotFound
      ? Messages.SearchPage.RoomNoLongerAvailable
      : bookingError === BookingErrors.RoomUnavailable
        ? unavailableRoomId
          ? Messages.SearchPage.RoomUnavailableForDatesWithId.replace(
              "{roomId}",
              unavailableRoomId.toString()
            )
          : Messages.SearchPage.RoomUnavailableForDates
        : bookingError === BookingErrors.InvalidSelection
          ? Messages.SearchPage.InvalidBookingSelection
          : null;

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <SearchPageRefreshScript hasSearch={Boolean(hasSearched)} />

      <section className="bg-[#3a2418] text-white pb-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div>
            <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-sm">
              Wynn Las Vegas
            </p>

            <h1 className="font-serif text-4xl mt-4">
              Experience Luxury Accommodations
            </h1>

            <p className="text-stone-200 mt-3 max-w-2xl">
              Search available rooms, review premium amenities, and complete
              your reservation.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-14 relative z-10">
        {(bookingErrorMessage || loadError) && (
          <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {bookingErrorMessage ?? loadError}
          </div>
        )}

        <SearchForm
          key={searchFormKey}
          defaultCheckInDate={rawCheckInDate}
          defaultCheckOutDate={rawCheckOutDate}
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