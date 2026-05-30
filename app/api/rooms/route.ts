import { NextRequest, NextResponse } from "next/server";
import { BookingStatus, RoomStatus } from "@/app/types/prisma-enums";
import { prisma } from "@/app/lib/prisma";
import { calculateNumberOfNights } from "@/app/lib/availability";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const checkInValue = searchParams.get("checkInDate");
    const checkOutValue = searchParams.get("checkOutDate");
    const guestCountValue = searchParams.get("guestCount");

    if (!checkInValue || !checkOutValue || !guestCountValue) {
      return NextResponse.json(
        { message: "Check-in date, check-out date, and guest count are required." },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkInValue);
    const checkOutDate = new Date(checkOutValue);
    const guestCount = Number(guestCountValue);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { message: "Please provide valid check-in and check-out dates." },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { message: "Check-out date must be after check-in date." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return NextResponse.json(
        { message: "Guest count must be at least 1." },
        { status: 400 }
      );
    }

    const numberOfNights = calculateNumberOfNights(checkInDate, checkOutDate);

    const rooms = await prisma.room.findMany({
      where: {
        isActive: true,
        status: RoomStatus.AVAILABLE,
        maxGuests: {
          gte: guestCount,
        },
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
        numberOfNights,
        estimatedSubtotal: Number(subtotal.toFixed(2)),
      };
    });

    console.info("Room search completed", {
      checkInDate: checkInValue,
      checkOutDate: checkOutValue,
      guestCount,
      roomsFound: result.length,
    });

    return NextResponse.json({ rooms: result });
  } catch (error) {
    console.error("Room search failed", error);

    return NextResponse.json(
      { message: "Unable to search rooms at this time. Please try again." },
      { status: 500 }
    );
  }
}