import { NextRequest } from "next/server";
import { ApiMessages } from "@/constants";
import { apiFail, apiOk } from "@/lib/api/api-response";
import { handleApiRequest } from "@/lib/api/api-handler";
import { validateApiKey } from "@/lib/security";
import { calculateNumberOfNights } from "@/app/lib/availability";
import { createBookingSession } from "@/app/lib/services/booking-session-service";
import { OperationNames } from "@/constants";

export async function POST(request: NextRequest) {
  return handleApiRequest(OperationNames.CreateBookingSession, async () => {
    const isAuthorized = validateApiKey(request);

    if (!isAuthorized) {
      return apiFail(ApiMessages.Unauthorized, {
        status: 401,
      });
    }

    const body = await request.json();

    const result = await createBookingSession({
      roomId: Number(body.roomId),
      checkInDate: String(body.checkInDate),
      checkOutDate: String(body.checkOutDate),
      guestCount: Number(body.guestCount),
    });

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
          new Date(String(body.checkInDate)),
          new Date(String(body.checkOutDate))
        ),
      },
      {
        status: 201,
      }
    );
  });
}