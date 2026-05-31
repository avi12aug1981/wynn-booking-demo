import { Messages } from "@/app/constants/messages";
import { prisma } from "./prisma";
import type { PrismaTransactionClient } from "@/app/types/prisma";
import { parseLocalDate } from "./utils/date";
import { BookingSessionStatus, BookingStatus, RoomStatus } from "@/app/types/prisma-enums";

/**
 * Hotel-style inventory model (not airline-style):
 *
 * - BookingSession = checkout flow state only (token URL, form timeout). It does NOT hold inventory.
 * - Confirmed Booking = the only hard inventory lock.
 * - Multiple guests may open the booking form for the same room; first to complete wins at submit time.
 */

export class RoomNotAvailableError extends Error {
  readonly status = 409;

  constructor(message: string) {
    super(message);
    this.name = "RoomNotAvailableError";
  }
}

export function calculateNumberOfNights(checkInDate: Date, checkOutDate: Date): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / millisecondsPerDay);
}

export type RoomAvailabilityReason = "available" | "booked" | "unavailable";

export type RoomAvailabilityCheck = {
  available: boolean;
  reason: RoomAvailabilityReason;
  message: string;
};

function overlappingDateRangeFilter(checkInDate: Date, checkOutDate: Date) {
  return {
    checkInDate: {
      lt: checkOutDate,
    },
    checkOutDate: {
      gt: checkInDate,
    },
  };
}

async function hasOverlappingConfirmedBooking(
  roomId: number,
  checkInDate: Date,
  checkOutDate: Date
) {
  return prisma.booking.findFirst({
    where: {
      roomId,
      status: BookingStatus.CONFIRMED,
      ...overlappingDateRangeFilter(checkInDate, checkOutDate),
    },
  });
}

export async function checkRoomAvailability(
  roomId: number,
  checkInValue: string,
  checkOutValue: string
): Promise<RoomAvailabilityCheck> {
  const checkInDate = parseLocalDate(checkInValue);
  const checkOutDate = parseLocalDate(checkOutValue);

  if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
    return {
      available: false,
      reason: "unavailable",
      message: Messages.Booking.InvalidDates,
    };
  }

  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      isActive: true,
      status: RoomStatus.AVAILABLE,
    },
  });

  if (!room) {
    return {
      available: false,
      reason: "unavailable",
      message: Messages.Booking.RoomNotAvailable,
    };
  }

  const overlappingBooking = await hasOverlappingConfirmedBooking(
    roomId,
    checkInDate,
    checkOutDate
  );

  if (overlappingBooking) {
    return {
      available: false,
      reason: "booked",
      message: Messages.Booking.RoomNoLongerAvailable,
    };
  }

  return {
    available: true,
    reason: "available",
    message: "",
  };
}

export async function isRoomAvailable(
  roomId: number,
  checkInDate: Date,
  checkOutDate: Date
): Promise<boolean> {
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      status: BookingStatus.CONFIRMED,
      ...overlappingDateRangeFilter(checkInDate, checkOutDate),
    },
  });

  return overlappingBooking === null;
}

export async function assertRoomAvailableForFinalBooking(
  tx: PrismaTransactionClient,
  params: {
    roomId: number;
    checkInDate: Date;
    checkOutDate: Date;
    bookingSessionId?: number;
  }
): Promise<void> {
  const overlappingBooking = await tx.booking.findFirst({
    where: {
      roomId: params.roomId,
      status: BookingStatus.CONFIRMED,
      ...overlappingDateRangeFilter(params.checkInDate, params.checkOutDate),
    },
  });

  if (overlappingBooking) {
    throw new RoomNotAvailableError(Messages.Booking.RoomNoLongerAvailable);
  }

  if (params.bookingSessionId) {
    const currentSession = await tx.bookingSession.findUnique({
      where: { id: params.bookingSessionId },
    });

    if (
      !currentSession ||
      currentSession.status !== BookingSessionStatus.ACTIVE ||
      currentSession.expiresAt <= new Date()
    ) {
      throw new RoomNotAvailableError(Messages.Booking.InvalidBookingSession);
    }
  }
}

/**
 * Serialize concurrent final bookings for the same room.
 * SQLite: row update acquires a write lock for the transaction.
 * PostgreSQL (production): replace with SELECT ... FOR UPDATE on Room.
 */
export async function lockRoomForBooking(
  tx: PrismaTransactionClient,
  roomId: number
): Promise<void> {
  const room = await tx.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      isActive: true,
      status: true,
    },
  });

  if (!room || !room.isActive || room.status !== RoomStatus.AVAILABLE) {
    throw new RoomNotAvailableError(Messages.Booking.RoomNotAvailable);
  }

  await tx.room.update({
    where: { id: roomId },
    data: {
      updatedAt: new Date(),
    },
  });
}
