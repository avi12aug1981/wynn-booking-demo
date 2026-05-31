import { calculateNumberOfNights } from "@/app/lib/availability";
import { prisma } from "@/app/lib/prisma";
import { BookingStatus, RoomStatus } from "@/app/types/prisma-enums";
import type { RoomRecord, RoomSearchResult } from "@/app/types/room";

export type RoomSearchFilters = {
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  petsAllowed?: boolean;
  nonSmoking?: boolean;
  minRating?: number;
};

export async function searchAvailableRooms(
  filters: RoomSearchFilters
): Promise<RoomSearchResult[]> {
  const checkInDate = new Date(filters.checkInDate);
  const checkOutDate = new Date(filters.checkOutDate);
  const numberOfNights = calculateNumberOfNights(checkInDate, checkOutDate);

  const rooms: RoomRecord[] = await prisma.room.findMany({
    where: {
      isActive: true,
      status: RoomStatus.AVAILABLE,
      maxGuests: {
        gte: filters.guestCount,
      },
      petsAllowed: filters.petsAllowed ? true : undefined,
      smokingAllowed: filters.nonSmoking ? false : undefined,
      rating: filters.minRating
        ? {
            gte: filters.minRating,
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

  return rooms.map((room) => {
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
}
