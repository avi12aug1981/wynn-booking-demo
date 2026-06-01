import { NextRequest } from "next/server";
import { BookingSessionStatus } from "@/app/types/prisma-enums";
import { prisma } from "@/app/lib/prisma";
import { ApiMessages, OperationNames } from "@/constants";
import { apiFail, apiOk } from "@/lib/api/api-response";
import { handleApiRequest } from "@/lib/api/api-handler";

type RouteParams = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteParams) {
  return handleApiRequest(OperationNames.GetBookingSession, async () => {
    const { token } = await context.params;

    const session = await prisma.bookingSession.findUnique({
      where: {
        token,
      },
      include: {
        room: true,
      },
    });

    if (!session) {
      return apiFail(ApiMessages.BookingSessionNotFound, {
        status: 404,
      });
    }

    if (session.status !== BookingSessionStatus.ACTIVE) {
      return apiFail(ApiMessages.BookingSessionInactive, {
        status: 400,
      });
    }

    if (session.expiresAt < new Date()) {
      await prisma.bookingSession.update({
        where: {
          token,
        },
        data: {
          status: BookingSessionStatus.EXPIRED,
        },
      });

      return apiFail(ApiMessages.BookingSessionExpired, {
        status: 400,
      });
    }

    return apiOk(session);
  });
}