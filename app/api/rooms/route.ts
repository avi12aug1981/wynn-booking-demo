import { NextRequest, NextResponse } from "next/server";
import { Messages } from "@/app/constants/messages";
import { searchAvailableRooms } from "@/features/rooms/services/room-search-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const checkInValue = searchParams.get("checkInDate");
    const checkOutValue = searchParams.get("checkOutDate");
    const guestCountValue = searchParams.get("guestCount");
    const petsAllowedParam = searchParams.get("petsAllowed");
    const nonSmokingParam = searchParams.get("nonSmoking");
    const minRatingParam = searchParams.get("minRating");

    if (!checkInValue || !checkOutValue || !guestCountValue) {
      return NextResponse.json(
        { message: Messages.RoomSearch.MissingSearchParameters },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkInValue);
    const checkOutDate = new Date(checkOutValue);
    const guestCount = Number(guestCountValue);
    const minRating = minRatingParam ? Number(minRatingParam) : undefined;

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { message: Messages.RoomSearch.InvalidDates },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { message: Messages.Booking.CheckoutMustBeAfterCheckin },
        { status: 400 }
      );
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return NextResponse.json(
        { message: Messages.RoomSearch.InvalidGuestCount },
        { status: 400 }
      );
    }

    if (
      minRating !== undefined &&
      (Number.isNaN(minRating) || minRating < 0 || minRating > 5)
    ) {
      return NextResponse.json(
        { message: Messages.RoomSearch.InvalidRating },
        { status: 400 }
      );
    }

    const result = await searchAvailableRooms({
      checkInDate: checkInValue,
      checkOutDate: checkOutValue,
      guestCount,
      petsAllowed: petsAllowedParam === "true",
      nonSmoking: nonSmokingParam === "true",
      minRating,
    });

    console.info("Room search completed", {
      checkInDate: checkInValue,
      checkOutDate: checkOutValue,
      guestCount,
      petsAllowed: petsAllowedParam,
      nonSmoking: nonSmokingParam,
      minRating,
      roomsFound: result.length,
    });

    return NextResponse.json({ rooms: result });
  } catch (error) {
    console.error(Messages.Common.RoomSearchFailed, error);

    return NextResponse.json(
      { message: Messages.RoomSearch.SearchFailed },
      { status: 500 }
    );
  }
}
