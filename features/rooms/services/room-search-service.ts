import { calculateNumberOfNights } from "@/app/lib/availability";
import type { RoomSearchResult } from "@/app/types/room";
import { roomRepository } from "@/features/rooms/services/room-repository";

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

  const rooms = await roomRepository.findAvailableRooms({
    checkInDate,
    checkOutDate,
    guestCount: filters.guestCount,
    petsAllowed: filters.petsAllowed,
    nonSmoking: filters.nonSmoking,
    minRating: filters.minRating,
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