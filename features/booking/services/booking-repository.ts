import { prisma } from "@/app/lib/prisma";
import { BookingStatus, PaymentStatus } from "@/app/types/prisma-enums";

type BookingEntity = NonNullable<
  Awaited<ReturnType<typeof prisma.booking.findFirst>>
>;

type BookingWithDetails = NonNullable<
  Awaited<
    ReturnType<
      typeof prisma.booking.findFirst<{
        include: {
          room: true;
          member: true;
          guests: {
            orderBy: {
              sequence: "asc";
            };
          };
        };
      }>
    >
  >
>;

export class BookingRepository {
  findByReferenceNumber(referenceNumber: string): Promise<BookingEntity | null> {
    return prisma.booking.findUnique({
      where: {
        referenceNumber,
      },
    });
  }

  findDetailsByReferenceNumber(
    referenceNumber: string
  ): Promise<BookingWithDetails | null> {
    return prisma.booking.findFirst({
      where: {
        referenceNumber,
      },
      include: {
        room: true,
        member: true,
        guests: {
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });
  }

  cancelByReferenceNumber(referenceNumber: string): Promise<BookingEntity> {
    return prisma.booking.update({
      where: {
        referenceNumber,
      },
      data: {
        status: BookingStatus.CANCELLED,
        paymentStatus: PaymentStatus.REFUNDED,
      },
    });
  }
}

export const bookingRepository = new BookingRepository();