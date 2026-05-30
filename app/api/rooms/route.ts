import { NextRequest, NextResponse } from "next/server";
import { Messages } from "@/app/constants/messages";
import { calculateNumberOfNights } from "@/app/lib/availability";
import { prisma } from "@/app/lib/prisma";
import { BookingStatus, RoomStatus } from "@/app/types/prisma-enums";
import type { RoomRecord } from "@/app/types/room";

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

    const numberOfNights = calculateNumberOfNights(checkInDate, checkOutDate);

    const rooms: RoomRecord[] = await prisma.room.findMany({
      where: {
        isActive: true,
        status: RoomStatus.AVAILABLE,
        maxGuests: {
          gte: guestCount,
        },
        petsAllowed: petsAllowedParam === "true" ? true : undefined,
        smokingAllowed: nonSmokingParam === "true" ? false : undefined,
        rating: minRating
          ? {
              gte: minRating,
            }
          : undefined,
        bookings: {
          none: {
            status: BookingStatus.CONFIRMED,
            checkInDate: {
              lt: checkOutDate,
            },
            checkOutDate: {
              gt: checkInDate,
            },
          },
        },
      },
      orderBy: {
        pricePerNight: "asc",
      },
    });

    const result = rooms.map((room) => {
      const pricePerNight = Number(room.pricePerNight);
      const subtotal = pricePerNight * numberOfNights;

      return {
        id: room.id,
        name: room.name,
        type: room.type,
        description: room.description,
        pricePerNight,
        maxGuests: room.maxGuests,
        amenities: room.amenities.split(","),
        imageUrl: room.imageUrl,
        petsAllowed: room.petsAllowed,
        smokingAllowed: room.smokingAllowed,
        rating: Number(room.rating),
        reviewCount: room.reviewCount,
        numberOfNights,
        estimatedSubtotal: Number(subtotal.toFixed(2)),
      };
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
