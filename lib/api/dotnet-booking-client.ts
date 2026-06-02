import type { RoomSearchResult } from "@/app/types/room";
import type { DemoMemberProfile } from "@/app/constants/demo-user";
import { getMemberAccessToken } from "@/app/constants/demo-user";
import { bookingApiConfig } from "@/lib/api/booking-api-config";

export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string | null;
  errors?: string[] | null;
  traceId?: string | null;
};

export type MemberBookingSummary = {
  referenceNumber: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  status: number;
  totalPrice: number;
};

export type ReservationDetails = {
  referenceNumber: string;
  roomId: number;
  roomName: string;
  firstName: string;
  lastName: string;
  contactEmail: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  totalPrice: number;
  status: number;
  paymentStatus: number;
  confirmationEmailSent: boolean;
  guests: Array<{
    sequence: number;
    firstName: string;
    lastName: string;
    ageGroup: number | string;
  }>;
};

const GENDER_MAP: Record<string, number> = {
  MALE: 0,
  FEMALE: 1,
  OTHER: 2,
  PREFER_NOT_TO_SAY: 3,
};

const AGE_GROUP_MAP: Record<string, number> = {
  ADULT: 0,
  CHILD: 1,
  INFANT: 2,
};

export const BOOKING_STATUS_LABELS = ["CONFIRMED", "CANCELLED"] as const;

function dotnetUrl(path: string) {
  return `${bookingApiConfig.dotnetApiUrl}${path}`;
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  return (await response.json()) as ApiEnvelope<T>;
}

function memberAuthHeaders(): HeadersInit {
  const token = getMemberAccessToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function jsonHeaders(extra?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...memberAuthHeaders(),
    ...extra,
  };
}

type DotNetRoom = {
  id: number;
  name: string;
  type: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  imageUrl?: string | null;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  rating: number;
  reviewCount: number;
  numberOfNights: number;
  estimatedSubtotal: number;
};

type DotNetBookingSession = {
  token: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  expiresAt?: string;
  room: {
    id: number;
    name: string;
    type: string;
    pricePerNight: number;
    maxGuests: number;
    amenities: string[];
    imageUrl?: string | null;
  };
};

function mapRoom(room: DotNetRoom): RoomSearchResult {
  return {
    id: room.id,
    name: room.name,
    type: room.type,
    description: room.description,
    pricePerNight: Number(room.pricePerNight),
    maxGuests: room.maxGuests,
    amenities: room.amenities ?? [],
    imageUrl: room.imageUrl,
    petsAllowed: room.petsAllowed,
    smokingAllowed: room.smokingAllowed,
    rating: Number(room.rating),
    reviewCount: room.reviewCount,
    numberOfNights: room.numberOfNights,
    estimatedSubtotal: Number(room.estimatedSubtotal),
  };
}

export async function loginDotNet(email: string, password: string) {
  const response = await fetch(dotnetUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const envelope = await parseEnvelope<{
    accessToken: string;
    expiresAtUtc: string;
    user: DemoMemberProfile;
  }>(response);

  return { response, envelope };
}

export async function getMemberBookingsDotNet() {
  const response = await fetch(dotnetUrl("/api/Bookings/me"), {
    headers: memberAuthHeaders(),
    cache: "no-store",
  });

  const envelope = await parseEnvelope<{ bookings: MemberBookingSummary[] }>(
    response
  );

  return {
    response,
    envelope,
    bookings: envelope.data?.bookings ?? [],
  };
}

export async function getBookingByReferenceDotNet(referenceNumber: string) {
  const response = await fetch(
    dotnetUrl(`/api/Bookings/${encodeURIComponent(referenceNumber)}`),
    { cache: "no-store" }
  );

  const envelope = await parseEnvelope<ReservationDetails>(response);

  return { response, envelope };
}

export async function cancelBookingDotNet(
  referenceNumber: string,
  cancellationReason?: string
) {
  const response = await fetch(
    dotnetUrl(`/api/Bookings/${encodeURIComponent(referenceNumber)}/cancel`),
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ cancellationReason: cancellationReason ?? null }),
      cache: "no-store",
    }
  );

  const envelope = await parseEnvelope<{ referenceNumber: string; message: string }>(
    response
  );

  return { response, envelope };
}

export async function modifyBookingDotNet(
  referenceNumber: string,
  body: {
    checkInDate?: string;
    checkOutDate?: string;
    adultCount?: number;
    childCount?: number;
    infantCount?: number;
    petCount?: number;
    specialRequests?: string;
    contactEmail?: string;
  }
) {
  const response = await fetch(
    dotnetUrl(`/api/Bookings/${encodeURIComponent(referenceNumber)}`),
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  const envelope = await parseEnvelope<{ referenceNumber: string; message: string }>(
    response
  );

  return { response, envelope };
}

export async function searchRoomsDotNet(params: {
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  petsAllowed?: boolean;
  nonSmoking?: boolean;
  minRating?: number;
}) {
  const query = new URLSearchParams({
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
    guestCount: String(params.guestCount),
  });

  if (params.petsAllowed) query.set("petsAllowed", "true");
  if (params.nonSmoking) query.set("nonSmoking", "true");
  if (params.minRating) query.set("minRating", String(params.minRating));

  const response = await fetch(`${dotnetUrl("/api/Rooms")}?${query}`, {
    cache: "no-store",
  });

  const envelope = await parseEnvelope<{ rooms: DotNetRoom[] }>(response);

  return {
    ok: response.ok && envelope.success,
    status: response.status,
    message: envelope.message,
    rooms: (envelope.data?.rooms ?? []).map(mapRoom),
  };
}

export async function createBookingSessionDotNet(body: {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
}) {
  const response = await fetch(dotnetUrl("/api/booking-sessions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [bookingApiConfig.apiKeyHeaderName]: bookingApiConfig.apiKey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const envelope = await parseEnvelope<{
    token: string;
    redirectUrl: string;
    numberOfNights: number;
  }>(response);

  return { response, envelope };
}

export async function getBookingSessionDotNet(token: string) {
  const response = await fetch(dotnetUrl(`/api/booking-sessions/${token}`), {
    cache: "no-store",
  });

  const envelope = await parseEnvelope<DotNetBookingSession>(response);

  return { response, envelope };
}

export function mapDotNetSessionForBookingPage(session: DotNetBookingSession & {
  guestCount: number;
  expiresAt?: string;
}) {
  return {
    token: session.token,
    checkInDate: session.checkInDate,
    checkOutDate: session.checkOutDate,
    guestCount: session.guestCount,
    room: {
      id: session.room.id,
      name: session.room.name,
      type: session.room.type,
      pricePerNight: session.room.pricePerNight,
      maxGuests: session.room.maxGuests,
      petsAllowed: false,
      imageUrl: session.room.imageUrl,
    },
  };
}

export async function createBookingDotNet(body: Record<string, unknown>) {
  const payload = {
    ...body,
    bookingType: body.bookingType === "MEMBER" ? 1 : 0,
    gender:
      typeof body.gender === "string"
        ? (GENDER_MAP[body.gender] ?? 3)
        : (body.gender ?? 3),
    guests: Array.isArray(body.guests)
      ? body.guests.map((guest) => {
          const entry = guest as Record<string, unknown>;
          return {
            ...entry,
            gender:
              typeof entry.gender === "string"
                ? (GENDER_MAP[entry.gender] ?? 3)
                : entry.gender,
            ageGroup:
              typeof entry.ageGroup === "string"
                ? (AGE_GROUP_MAP[entry.ageGroup] ?? 0)
                : entry.ageGroup,
          };
        })
      : body.guests,
  };

  const response = await fetch(dotnetUrl("/api/Bookings"), {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const envelope = await parseEnvelope<{
    referenceNumber: string;
  }>(response);

  return { response, envelope };
}

const AGE_GROUP_LABELS = ["ADULT", "CHILD", "INFANT"] as const;

export function mapDotNetBookingForConfirmation(
  booking: ReservationDetails & {
    pricePerNight?: number;
    discountAmount?: number;
    taxAmount?: number;
    addressLine1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    adultCount?: number;
    childCount?: number;
    infantCount?: number;
    petCount?: number;
  }
) {
  const PAYMENT_STATUS_LABELS = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

  return {
    referenceNumber: booking.referenceNumber,
    firstName: booking.firstName,
    lastName: booking.lastName,
    contactEmail: booking.contactEmail,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    numberOfNights: booking.numberOfNights,
    pricePerNight: Number(booking.pricePerNight ?? 0),
    discountAmount: Number(booking.discountAmount ?? 0),
    taxAmount: Number(booking.taxAmount ?? 0),
    totalPrice: Number(booking.totalPrice),
    status: BOOKING_STATUS_LABELS[booking.status] ?? "CONFIRMED",
    paymentStatus: PAYMENT_STATUS_LABELS[booking.paymentStatus] ?? "PAID",
    confirmationEmailSent: booking.confirmationEmailSent,
    addressLine1: booking.addressLine1 ?? "",
    addressLine2: booking.addressLine2,
    city: booking.city ?? "",
    state: booking.state ?? "",
    zipCode: booking.zipCode ?? "",
    country: booking.country ?? "USA",
    adultCount: booking.adultCount ?? 1,
    childCount: booking.childCount ?? 0,
    infantCount: booking.infantCount ?? 0,
    petCount: booking.petCount ?? 0,
    room: { name: booking.roomName, imageUrl: null },
    guests: (booking.guests ?? []).map((guest) => ({
      id: guest.sequence,
      sequence: guest.sequence,
      firstName: guest.firstName,
      lastName: guest.lastName,
      ageGroup:
        typeof guest.ageGroup === "number"
          ? (AGE_GROUP_LABELS[guest.ageGroup] ?? "ADULT")
          : String(guest.ageGroup),
    })),
  };
}
