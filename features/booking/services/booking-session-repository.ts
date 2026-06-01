import { prisma } from "@/app/lib/prisma";
import { BookingSessionStatus } from "@/app/types/prisma-enums";

type BookingSessionEntity = NonNullable<
  Awaited<ReturnType<typeof prisma.bookingSession.findFirst>>
>;

export class BookingSessionRepository {
  findByToken(token: string): Promise<BookingSessionEntity | null> {
    return prisma.bookingSession.findUnique({
      where: {
        token,
      },
    });
  }

  expireSession(id: number): Promise<BookingSessionEntity> {
    return prisma.bookingSession.update({
      where: {
        id,
      },
      data: {
        status: BookingSessionStatus.EXPIRED,
      },
    });
  }

  consumeSession(id: number): Promise<BookingSessionEntity> {
    return prisma.bookingSession.update({
      where: {
        id,
      },
      data: {
        status: BookingSessionStatus.CONSUMED,
      },
    });
  }
}

export const bookingSessionRepository = new BookingSessionRepository();