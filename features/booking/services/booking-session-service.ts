import { BookingSessionStatus, RoomStatus } from "@/app/types/prisma-enums";
import { checkRoomAvailability } from "@/app/lib/availability";
import { createBookingSessionExpiresAt } from "@/app/lib/utils/booking-session";
import { prisma } from "@/app/lib/prisma";

export type CreateBookingSessionInput = {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
};

export type CreateBookingSessionResult =
  | {
      success: true;
      token: string;
      redirectUrl: string;
    }
  | {
      success: false;
      status: 400 | 404 | 409 | 500;
      code:
        | "invalid-room"
        | "invalid-guest-count"
        | "invalid-dates"
        | "room-unavailable"
        | "room-booked"
        | "unexpected-error";
      message: string;
    };

function generateBookingSessionToken() {
  const randomPart = crypto.randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase();

  return `BSN_${randomPart}`;
}

export async function createBookingSession(
  input: CreateBookingSessionInput
): Promise<CreateBookingSessionResult> {
  const roomId = Number(input.roomId);
  const guestCount = Number(input.guestCount);
  const checkInDate = new Date(input.checkInDate);
  const checkOutDate = new Date(input.checkOutDate);

  if (!Number.isInteger(roomId) || roomId <= 0) {
    return {
      success: false,
      status: 400,
      code: "invalid-room",
      message: "Invalid room selection.",
    };
  }

  if (!Number.isInteger(guestCount) || guestCount < 1) {
    return {
      success: false,
      status: 400,
      code: "invalid-guest-count",
      message: "Guest count must be at least 1.",
    };
  }

  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime()) ||
    checkOutDate <= checkInDate
  ) {
    return {
      success: false,
      status: 400,
      code: "invalid-dates",
      message: "Invalid booking dates.",
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
      success: false,
      status: 404,
      code: "room-unavailable",
      message: "Selected room is not available.",
    };
  }

  if (guestCount > room.maxGuests) {
    return {
      success: false,
      status: 400,
      code: "invalid-guest-count",
      message: "Guest count exceeds room capacity.",
    };
  }

  const availability = await checkRoomAvailability(
    roomId,
    input.checkInDate,
    input.checkOutDate
  );

  if (!availability.available) {
    return {
      success: false,
      status: availability.reason === "booked" ? 409 : 404,
      code: availability.reason === "booked" ? "room-booked" : "room-unavailable",
      message: availability.message,
    };
  }

  try {
    const expiresAt = createBookingSessionExpiresAt();

    const session = await prisma.bookingSession.create({
      data: {
        token: generateBookingSessionToken(),
        roomId,
        checkInDate,
        checkOutDate,
        guestCount,
        expiresAt,
      },
    });

    return {
      success: true,
      token: session.token,
      redirectUrl: `/booking/${session.token}`,
    };
  } catch {
    return {
      success: false,
      status: 500,
      code: "unexpected-error",
      message: "Unable to start booking at this time.",
    };
  }
}
