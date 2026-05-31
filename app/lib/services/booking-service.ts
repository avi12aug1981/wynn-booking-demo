import {
  BookingSessionStatus,
  BookingStatus,
  PaymentStatus,
  RoomStatus,
} from "@/app/types/prisma-enums";
import type { PrismaTransactionClient } from "@/app/types/prisma";
import { ApplicationConstants, Messages } from "@/app/constants";
import { CreateBookingRequest } from "@/app/types/booking";
import {
  assertRoomAvailableForFinalBooking,
  calculateNumberOfNights,
  checkRoomAvailability,
  lockRoomForBooking,
  RoomNotAvailableError,
} from "@/app/lib/availability";
import { prisma } from "@/app/lib/prisma";
import {
  generateBookingReference,
  generatePaymentTransactionId,
} from "@/app/lib/utils/reference-number";

function validateBasicBookingRequest(request: CreateBookingRequest): string | null {
  if (!request.roomId) return Messages.Booking.RoomRequired;
  if (!request.firstName?.trim()) return Messages.Booking.FirstNameRequired;
  if (!request.lastName?.trim()) return Messages.Booking.LastNameRequired;
  if (!request.contactEmail?.trim()) return Messages.Booking.ContactEmailRequired;
  if (!request.addressLine1?.trim()) return Messages.Booking.AddressRequired;
  if (!request.city?.trim()) return Messages.Booking.CityRequired;
  if (!request.state?.trim()) return Messages.Booking.StateRequired;
  if (!request.zipCode?.trim()) return Messages.Booking.ZipCodeRequired;
  if (!request.checkInDate || !request.checkOutDate) return Messages.Booking.DatesRequired;

  return null;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isSafeText(value: string): boolean {
  return /^[a-zA-Z0-9\s.,'-]+$/.test(value);
}

function hasInvalidGuestName(request: CreateBookingRequest): boolean {
  return (
    !isSafeText(request.firstName) ||
    !isSafeText(request.lastName) ||
    request.guests?.some(
      (guest) => !isSafeText(guest.firstName) || !isSafeText(guest.lastName)
    ) === true
  );
}

export async function createBooking(request: CreateBookingRequest) {
  const validationMessage = validateBasicBookingRequest(request);

  if (validationMessage) {
    return { success: false, status: 400, message: validationMessage };
  }

  if (!isValidEmail(request.contactEmail.trim())) {
    return { success: false, status: 400, message: Messages.Booking.InvalidEmail };
  }

  if (hasInvalidGuestName(request)) {
    return { success: false, status: 400, message: Messages.Booking.InvalidGuestName };
  }

  const checkInDate = new Date(request.checkInDate);
  const checkOutDate = new Date(request.checkOutDate);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return { success: false, status: 400, message: Messages.Booking.InvalidDates };
  }

  if (checkOutDate <= checkInDate) {
    return { success: false, status: 400, message: Messages.Booking.CheckoutMustBeAfterCheckin };
  }

  const adultCount = request.adultCount;
  const childCount = request.childCount ?? 0;
  const infantCount = request.infantCount ?? 0;
  const petCount = request.petCount ?? 0;
  const totalGuestCount = adultCount + childCount + infantCount;

  if (adultCount < 1) {
    return { success: false, status: 400, message: Messages.Booking.AdultRequired };
  }

  if (childCount < 0 || infantCount < 0 || petCount < 0) {
    return { success: false, status: 400, message: Messages.Booking.InvalidGuestCount };
  }

  const room = await prisma.room.findFirst({
    where: {
      id: request.roomId,
      isActive: true,
      status: RoomStatus.AVAILABLE,
    },
  });

  if (!room) {
    return { success: false, status: 404, message: Messages.Booking.RoomNotAvailable };
  }

  if (totalGuestCount > room.maxGuests) {
    return { success: false, status: 400, message: Messages.Booking.RoomCapacityExceeded };
  }

  if (!room.petsAllowed && petCount > 0) {
    return {
      success: false,
      status: 400,
      message: Messages.Booking.PetsNotAllowed,
    };
  }

  if (room.petsAllowed && petCount > 2) {
    return {
      success: false,
      status: 400,
      message: Messages.RoomSearch.MaxPetsExceeded,
    };
  }

  let bookingSessionId: number | undefined;

  if (request.bookingSessionToken) {
    const session = await prisma.bookingSession.findUnique({
      where: { token: request.bookingSessionToken },
    });

    if (!session || session.status !== BookingSessionStatus.ACTIVE) {
      return {
        success: false,
        status: 409,
        message: Messages.Booking.InvalidBookingSession,
      };
    }

    if (session.expiresAt <= new Date()) {
      await prisma.bookingSession.update({
        where: { id: session.id },
        data: { status: BookingSessionStatus.EXPIRED },
      });

      return {
        success: false,
        status: 409,
        message: Messages.Booking.InvalidBookingSession,
      };
    }

    if (
      session.roomId !== room.id ||
      session.guestCount !== totalGuestCount ||
      session.checkInDate.getTime() !== checkInDate.getTime() ||
      session.checkOutDate.getTime() !== checkOutDate.getTime()
    ) {
      return {
        success: false,
        status: 400,
        message: Messages.Booking.InvalidBookingSession,
      };
    }

    bookingSessionId = session.id;
  }

  const availability = await checkRoomAvailability(
    room.id,
    request.checkInDate,
    request.checkOutDate
  );

  if (!availability.available) {
    return { success: false, status: 409, message: availability.message };
  }

  const numberOfNights = calculateNumberOfNights(checkInDate, checkOutDate);
  const pricePerNight = Number(room.pricePerNight);
  const discountAmount = 0;
  const taxAmount = Number(
    (pricePerNight * numberOfNights * ApplicationConstants.TaxRate).toFixed(2)
  );
  const totalPrice = Number(
    (pricePerNight * numberOfNights - discountAmount + taxAmount).toFixed(2)
  );

  try {
    const booking = await prisma.$transaction(
      async (tx: PrismaTransactionClient) => {
        await lockRoomForBooking(tx, room.id);

        await assertRoomAvailableForFinalBooking(tx, {
          roomId: room.id,
          checkInDate,
          checkOutDate,
          bookingSessionId,
        });

        const referenceNumber = generateBookingReference();
        const paymentTransactionId = generatePaymentTransactionId();

        const createdBooking = await tx.booking.create({
          data: {
            referenceNumber,
            roomId: room.id,
            bookingSessionId,
            memberId: request.memberId,
            bookingType: request.bookingType,
            firstName: request.firstName.trim(),
            lastName: request.lastName.trim(),
            gender: request.gender,
            contactEmail: request.contactEmail.trim(),
            adultCount,
            childCount,
            infantCount,
            petCount,
            checkInDate,
            checkOutDate,
            specialRequests: request.specialRequests?.trim(),
            addressLine1: request.addressLine1.trim(),
            addressLine2: request.addressLine2?.trim(),
            city: request.city.trim(),
            state: request.state.trim(),
            zipCode: request.zipCode.trim(),
            country: request.country ?? ApplicationConstants.DefaultCountry,
            pricePerNight,
            numberOfNights,
            discountAmount,
            taxAmount,
            totalPrice,
            paymentStatus: PaymentStatus.PAID,
            paymentTransactionId,
            status: BookingStatus.CONFIRMED,
            confirmationEmailSent: true,
            bookingSource: ApplicationConstants.BookingSource,
            guests: {
              create:
                request.guests?.map((guest) => ({
                  sequence: guest.sequence,
                  firstName: guest.firstName.trim(),
                  lastName: guest.lastName.trim(),
                  gender: guest.gender,
                  ageGroup: guest.ageGroup,
                })) ?? [],
            },
          },
          include: {
            room: true,
            guests: true,
          },
        });

        if (bookingSessionId) {
          await tx.bookingSession.update({
            where: { id: bookingSessionId },
            data: { status: BookingSessionStatus.CONSUMED },
          });
        }

        return createdBooking;
      },
      {
        isolationLevel: "Serializable",
        maxWait: 5000,
        timeout: 10000,
      }
    );

    console.info("Booking created successfully", {
      referenceNumber: booking.referenceNumber,
      roomId: booking.roomId,
      bookingType: booking.bookingType,
    });

    return {
      success: true,
      status: 201,
      data: {
        referenceNumber: booking.referenceNumber,
        roomName: booking.room.name,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        numberOfNights: booking.numberOfNights,
        totalPrice: Number(booking.totalPrice),
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.status,
        confirmationEmailSent: booking.confirmationEmailSent,
      },
    };
  } catch (error) {
    if (error instanceof RoomNotAvailableError) {
      return { success: false, status: error.status, message: error.message };
    }

    throw error;
  }
}

export async function getBookingByReferenceNumber(referenceNumber: string) {
  const booking = await prisma.booking.findUnique({
    where: {
      referenceNumber,
    },
    include: {
      room: true,
      member: true,
      guests: {
        orderBy: {
          sequence: "asc",
        },
      },
    },
  });

  if (!booking) {
    return {
      success: false,
      status: 404,
      message: Messages.Booking.BookingNotFound,
    };
  }

  return {
    success: true,
    status: 200,
    data: booking,
  };
}

export async function cancelBooking(referenceNumber: string) {
  const booking = await prisma.booking.findUnique({
    where: { referenceNumber },
  });

  if (!booking) {
    return {
      success: false,
      status: 404,
      message: Messages.Booking.BookingNotFound,
    };
  }

  if (booking.status === BookingStatus.CANCELLED) {
    return {
      success: false,
      status: 400,
      message: Messages.Booking.BookingAlreadyCancelled,
    };
  }

  const cancelledBooking = await prisma.booking.update({
    where: { referenceNumber },
    data: {
      status: BookingStatus.CANCELLED,
      paymentStatus: PaymentStatus.REFUNDED,
    },
  });

  console.info("Booking cancelled successfully", {
    referenceNumber: cancelledBooking.referenceNumber,
  });

  return {
    success: true,
    status: 200,
    data: {
      referenceNumber: cancelledBooking.referenceNumber,
      bookingStatus: cancelledBooking.status,
      paymentStatus: cancelledBooking.paymentStatus,
      message: Messages.Booking.BookingCancelled,
    },
  };
}