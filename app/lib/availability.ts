import { BookingStatus } from "@/app/types/prisma-enums";
import { prisma } from "./prisma";

export function calculateNumberOfNights(checkInDate: Date, checkOutDate: Date): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / millisecondsPerDay);
}

export async function isRoomAvailable(roomId: number, checkInDate: Date, checkOutDate: Date): Promise<boolean> {
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      status: BookingStatus.CONFIRMED,
      checkInDate: {
        lt: checkOutDate,
      },
      checkOutDate: {
        gt: checkInDate,
      },
    },
  });

  return overlappingBooking === null;
}