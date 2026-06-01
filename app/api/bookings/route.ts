import { NextRequest } from "next/server";
import { ApiMessages, OperationNames } from "@/constants";
import { apiFail, apiOk } from "@/lib/api/api-response";
import { handleApiRequest } from "@/lib/api/api-handler";
import { createBooking } from "@/features/booking/services/booking-service";

export async function POST(request: NextRequest) {
  return handleApiRequest(OperationNames.CreateBooking, async () => {
    const body = await request.json();
    const result = await createBooking(body);

    if (!result.success) {
      return apiFail(result.message ?? ApiMessages.UnexpectedError, {
        status: result.status,
      });
    }

    return apiOk(result.data, {
      status: result.status,
    });
  });
}