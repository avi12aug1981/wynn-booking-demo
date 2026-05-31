import { AgeGroup, BookingType, Gender } from "@/app/types/prisma-enums";

export type BookingGuestRequest = {
  sequence: number;
  firstName: string;
  lastName: string;
  gender?: Gender;
  ageGroup: AgeGroup;
};

export type CreateBookingRequest = {
  bookingSessionToken?: string;
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
