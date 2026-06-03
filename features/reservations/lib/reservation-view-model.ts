import type { ReservationDetails } from "@/lib/api/dotnet-booking-client";
import { BOOKING_STATUS_LABELS } from "@/lib/api/dotnet-booking-client";

const PAYMENT_STATUS_LABELS = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

export type ReservationViewModel = {
  referenceNumber: string;
  firstName: string;
  lastName: string;
  contactEmail: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  pricePerNight: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  statusLabel: string;
  paymentStatusLabel: string;
  confirmationEmailSent: boolean;
  adultCount: number;
  childCount: number;
  infantCount: number;
  petCount: number;
  specialRequests: string | null;
  room: {
    name: string;
    imageUrl: string | null;
  };
};

export function mapReservationDetailsToViewModel(
  booking: ReservationDetails
): ReservationViewModel {
  return {
    referenceNumber: booking.referenceNumber,
    firstName: booking.firstName,
    lastName: booking.lastName,
    contactEmail: booking.contactEmail,
    addressLine1: booking.addressLine1 ?? "",
    addressLine2: booking.addressLine2,
    city: booking.city ?? "",
    state: booking.state ?? "",
    zipCode: booking.zipCode ?? "",
    country: booking.country ?? "USA",
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    numberOfNights: booking.numberOfNights,
    pricePerNight: Number(booking.pricePerNight ?? 0),
    discountAmount: Number(booking.discountAmount ?? 0),
    taxAmount: Number(booking.taxAmount ?? 0),
    totalPrice: Number(booking.totalPrice),
    statusLabel: BOOKING_STATUS_LABELS[booking.status] ?? "CONFIRMED",
    paymentStatusLabel:
      PAYMENT_STATUS_LABELS[booking.paymentStatus] ?? "PAID",
    confirmationEmailSent: booking.confirmationEmailSent,
    adultCount: booking.adultCount ?? 1,
    childCount: booking.childCount ?? 0,
    infantCount: booking.infantCount ?? 0,
    petCount: booking.petCount ?? 0,
    specialRequests: booking.specialRequests ?? null,
    room: {
      name: booking.roomName,
      imageUrl: null,
    },
  };
}

export function formatReservationDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCityStateZip(city: string, state: string, zipCode: string) {
  const parts = [city, state].filter((part) => part.trim().length > 0);

  if (parts.length === 0 && !zipCode.trim()) {
    return "";
  }

  const cityState = parts.join(", ");
  return zipCode.trim() ? `${cityState} ${zipCode}`.trim() : cityState;
}
