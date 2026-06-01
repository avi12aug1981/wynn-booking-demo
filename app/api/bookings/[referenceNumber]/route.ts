import { NextRequest } from "next/server";
import { ApiMessages, OperationNames } from "@/constants";
import { apiFail, apiOk } from "@/lib/api/api-response";
import { handleApiRequest } from "@/lib/api/api-handler";
import { getBookingByReferenceNumber } from "@/features/booking/services/booking-service";

type RouteParams = {
  params: Promise<{
    referenceNumber: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteParams) {
  return handleApiRequest(OperationNames.GetBooking, async () => {
    const { referenceNumber } = await context.params;
    const result = await getBookingByReferenceNumber(referenceNumber);

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