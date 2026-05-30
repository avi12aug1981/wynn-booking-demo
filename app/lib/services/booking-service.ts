import {
    BookingStatus,
    BookingType,
    Gender,
    PaymentStatus,
    RoomStatus,
  } from "@prisma/client";
  import { prisma } from "@/app/lib/prisma";
  import { calculateNumberOfNights, isRoomAvailable } from "@/app/lib/availability";
  import {
    generateBookingReference,
    generatePaymentTransactionId,
  } from "@/app/lib/utils/reference-number";
  
  type BookingGuestRequest = {
    sequence: number;
    firstName: string;
    lastName: string;
    gender?: Gender;
    ageGroup: "ADULT" | "CHILD" | "INFANT";
  };
  
  export type CreateBookingRequest = {
    roomId: number;
    memberId?: number;
    bookingType: BookingType;
    firstName: string;
    lastName: string;
    gender: Gender;
    contactEmail: string;
    adultCount: number;
    childCount?: number;
    infantCount?: number;
    petCount?: number;
    guests?: BookingGuestRequest[];
    checkInDate: string;
    checkOutDate: string;
    specialRequests?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  
  function validateBasicBookingRequest(request: CreateBookingRequest): string | null {
    if (!request.roomId) return "Room is required.";
    if (!request.firstName?.trim()) return "First name is required.";
    if (!request.lastName?.trim()) return "Last name is required.";
    if (!request.contactEmail?.trim()) return "Contact email is required.";
    if (!request.addressLine1?.trim()) return "Address line 1 is required.";
    if (!request.city?.trim()) return "City is required.";
    if (!request.state?.trim()) return "State is required.";
    if (!request.zipCode?.trim()) return "ZIP code is required.";
    if (!request.checkInDate || !request.checkOutDate) return "Check-in and check-out dates are required.";
    return null;
  }
  
  function isSafeText(value: string): boolean {
    return /^[a-zA-Z0-9\s.,'-]+$/.test(value);
  }
  
  export async function createBooking(request: CreateBookingRequest) {
    const validationMessage = validateBasicBookingRequest(request);
  
    if (validationMessage) {
      return { success: false, status: 400, message: validationMessage };
    }
  
    if (!isSafeText(request.firstName) || !isSafeText(request.lastName)) {
      return { success: false, status: 400, message: "Name contains invalid characters." };
    }
  
    const checkInDate = new Date(request.checkInDate);
    const checkOutDate = new Date(request.checkOutDate);
  
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return { success: false, status: 400, message: "Please provide valid booking dates." };
    }
  
    if (checkOutDate <= checkInDate) {
      return { success: false, status: 400, message: "Check-out date must be after check-in date." };
    }
  
    const adultCount = request.adultCount;
    const childCount = request.childCount ?? 0;
    const infantCount = request.infantCount ?? 0;
    const petCount = request.petCount ?? 0;
    const totalGuestCount = adultCount + childCount + infantCount;
  
    if (adultCount < 1) {
      return { success: false, status: 400, message: "At least one adult guest is required." };
    }
  
    const room = await prisma.room.findFirst({
      where: {
        id: request.roomId,
        isActive: true,
        status: RoomStatus.AVAILABLE,
      },
    });
  
    if (!room) {
      return { success: false, status: 404, message: "Selected room is not available." };
    }
  
    if (totalGuestCount > room.maxGuests) {
      return { success: false, status: 400, message: "Guest count exceeds room capacity." };
    }
  
    if (petCount > 0 && !room.petsAllowed) {
      return { success: false, status: 400, message: "Pets are not allowed in the selected room." };
    }
  
    const available = await isRoomAvailable(room.id, checkInDate, checkOutDate);
  
    if (!available) {
      return {
        success: false,
        status: 409,
        message: "This room is no longer available for the selected dates.",
      };
    }
  
    const numberOfNights = calculateNumberOfNights(checkInDate, checkOutDate);
    const pricePerNight = Number(room.pricePerNight);
    const discountAmount = 0;
    const taxAmount = Number((pricePerNight * numberOfNights * 0.13).toFixed(2));
    const totalPrice = Number((pricePerNight * numberOfNights - discountAmount + taxAmount).toFixed(2));
  
    const referenceNumber = generateBookingReference();
    const paymentTransactionId = generatePaymentTransactionId();
  
    const booking = await prisma.booking.create({
      data: {
        referenceNumber,
        roomId: room.id,
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
        country: request.country ?? "USA",
        pricePerNight,
        numberOfNights,
        discountAmount,
        taxAmount,
        totalPrice,
        paymentStatus: PaymentStatus.PAID,
        paymentTransactionId,
        status: BookingStatus.CONFIRMED,
        confirmationEmailSent: true,
        bookingSource: "WEB",
        guests: {
          create: request.guests?.map((guest) => ({
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
  }