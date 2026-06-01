import { NextRequest } from "next/server";
import { Messages } from "@/app/constants/messages";
import { apiFail, apiOk } from "@/lib/api/api-response";
import { handleApiRequest } from "@/lib/api/api-handler";
import { logger } from "@/lib/logger";
import { LogEvents, OperationNames } from "@/constants";
import { searchAvailableRooms } from "@/features/rooms/services/room-search-service";

export async function GET(request: NextRequest) {
  return handleApiRequest(OperationNames.SearchRooms, async () => {
    const searchParams = request.nextUrl.searchParams;
    const checkInValue = searchParams.get("checkInDate");
    const checkOutValue = searchParams.get("checkOutDate");
    const guestCountValue = searchParams.get("guestCount");
    const petsAllowedParam = searchParams.get("petsAllowed");
    const nonSmokingParam = searchParams.get("nonSmoking");
    const minRatingParam = searchParams.get("minRating");

    if (!checkInValue || !checkOutValue || !guestCountValue) {
      return apiFail(Messages.RoomSearch.MissingSearchParameters, {
        status: 400,
      });
    }

    const checkInDate = new Date(checkInValue);
    const checkOutDate = new Date(checkOutValue);
    const guestCount = Number(guestCountValue);
    const minRating = minRatingParam ? Number(minRatingParam) : undefined;

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      return apiFail(Messages.RoomSearch.InvalidDates, {
        status: 400,
      });
    }

    if (checkOutDate <= checkInDate) {
      return apiFail(Messages.Booking.CheckoutMustBeAfterCheckin, {
        status: 400,
      });
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return apiFail(Messages.RoomSearch.InvalidGuestCount, {
        status: 400,
      });
    }

    if (
      minRating !== undefined &&
      (Number.isNaN(minRating) || minRating < 0 || minRating > 5)
    ) {
      return apiFail(Messages.RoomSearch.InvalidRating, {
        status: 400,
      });
    }

    const result = await searchAvailableRooms({
      checkInDate: checkInValue,
      checkOutDate: checkOutValue,
      guestCount,
      petsAllowed: petsAllowedParam === "true",
      nonSmoking: nonSmokingParam === "true",
      minRating,
    });

    logger.info(OperationNames.SearchRooms, LogEvents.RoomSearchCompleted, {
      checkInDate: checkInValue,
      checkOutDate: checkOutValue,
      guestCount,
      petsAllowed: petsAllowedParam,
      nonSmoking: nonSmokingParam,
      minRating,
      roomsFound: result.length,
    });

    return apiOk({
      rooms: result,
    });
  });
}