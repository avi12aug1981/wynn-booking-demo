import { NextRequest } from "next/server";
import { ApiMessages, OperationNames, ValidationMessages } from "@/constants";
import { apiFail, apiOk, apiValidationFail } from "@/lib/api/api-response";
import { handleApiRequest } from "@/lib/api/api-handler";
import { sanitizeText, validateApiKey } from "@/lib/security";
import { calculateNumberOfNights } from "@/app/lib/availability";
import { createBookingSession } from "@/app/lib/services/booking-session-service";

type BookingSessionRequest = {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
};

function parseBookingSessionRequest(body: unknown): BookingSessionRequest {
  const payload = body as Record<string, unknown>;

  return {
    roomId: Number(payload.roomId),
    checkInDate: sanitizeText(payload.checkInDate),
    checkOutDate: sanitizeText(payload.checkOutDate),
    guestCount: Number(payload.guestCount),
  };
}

function validateBookingSessionRequest(request: BookingSessionRequest): string[] {
  const errors: string[] = [];

  if (!Number.isInteger(request.roomId) || request.roomId <= 0) {
    errors.push(ValidationMessages.RoomRequired);
  }

  if (!request.checkInDate) {
    errors.push(ValidationMessages.RequiredField);
  }

  if (!request.checkOutDate) {
    errors.push(ValidationMessages.RequiredField);
  }

  if (!Number.isInteger(request.guestCount) || request.guestCount < 1) {
    errors.push(ValidationMessages.InvalidGuestCount);
  }

  return errors;
}

export async function POST(request: NextRequest) {
  return handleApiRequest(OperationNames.CreateBookingSession, async () => {
    const isAuthorized = validateApiKey(request);

    if (!isAuthorized) {
      return apiFail(ApiMessages.Unauthorized, {
        status: 401,
      });
    }

    const body = await request.json();
    const bookingSessionRequest = parseBookingSessionRequest(body);
    const validationErrors =
      validateBookingSessionRequest(bookingSessionRequest);

    if (validationErrors.length > 0) {
      return apiValidationFail(validationErrors);
    }

    const result = await createBookingSession(bookingSessionRequest);

    if (!result.success) {
      return apiFail(result.message, {
        status: result.status,
      });
    }

    return apiOk(
      {
        token: result.token,
        redirectUrl: result.redirectUrl,
        numberOfNights: calculateNumberOfNights(
          new Date(bookingSessionRequest.checkInDate),
          new Date(bookingSessionRequest.checkOutDate)
        ),
      },
      {
        status: 201,
      }
    );
  });
}