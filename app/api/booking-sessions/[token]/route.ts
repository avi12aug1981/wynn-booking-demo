import { NextRequest, NextResponse } from "next/server";
import { BookingSessionStatus } from "@/app/types/prisma-enums";
import { prisma } from "@/app/lib/prisma";
import { Messages } from "@/app/constants/messages";
import { randomUUID } from "crypto";

type RouteParams = {
  params: Promise<{
    token: string;
  }>;
};

function generateBookingSessionToken() {
    const randomPart = randomUUID()
      .replaceAll("-", "")
      .slice(0, 16)
      .toUpperCase();
  
    return `BSN_${randomPart}`;
  }

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
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
      return NextResponse.json(
        { success: false, message: "Booking session not found." },
        { status: 404 }
      );
    }

    if (session.status !== BookingSessionStatus.ACTIVE) {
      return NextResponse.json(
        { success: false, message: "Booking session is no longer active." },
        { status: 400 }
      );
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

      return NextResponse.json(
        { success: false, message: "Booking session has expired." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Get booking session failed", error);

    return NextResponse.json(
      { success: false, message: Messages.Common.UnexpectedError },
      { status: 500 }
    );
  }
}