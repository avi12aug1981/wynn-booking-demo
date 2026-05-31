import { prisma } from "../app/lib/prisma";
import {
  BookingSessionStatus,
  BookingStatus,
  PaymentStatus,
  RoomStatus,
} from "../app/types/prisma-enums";

type ListedRoom = {
  id: number;
  name: string;
  type: string;
  pricePerNight: unknown;
  maxGuests: number;
  petsAllowed: boolean;
  status: RoomStatus;
  isActive: boolean;
};

type ListedBooking = {
  referenceNumber: string;
  firstName: string;
  lastName: string;
  contactEmail: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: unknown;
  createdAt: Date;
};

const roomListSelect = {
  id: true,
  name: true,
  type: true,
  pricePerNight: true,
  maxGuests: true,
  petsAllowed: true,
  status: true,
  isActive: true,
} as const;

const bookingListSelect = {
  referenceNumber: true,
  firstName: true,
  lastName: true,
  contactEmail: true,
  status: true,
  paymentStatus: true,
  totalPrice: true,
  createdAt: true,
} as const;

async function resetBookings() {
  await prisma.booking.updateMany({
    where: { status: BookingStatus.CONFIRMED },
    data: {
      status: BookingStatus.CANCELLED,
      paymentStatus: PaymentStatus.REFUNDED,
    },
  });

  await prisma.bookingSession.updateMany({
    where: { status: BookingSessionStatus.ACTIVE },
    data: { status: BookingSessionStatus.EXPIRED },
  });

  console.log("✅ Demo reset complete: confirmed bookings cancelled, active sessions expired.");
}

async function activateAllRooms() {
  await prisma.room.updateMany({
    data: {
      status: RoomStatus.AVAILABLE,
      isActive: true,
    },
  });

  console.log("✅ All rooms are active and available.");
}

async function listRooms() {
  const rooms = (await prisma.room.findMany({
    orderBy: { pricePerNight: "asc" },
    select: roomListSelect,
  })) as ListedRoom[];

  console.table(
    rooms.map((room: ListedRoom) => ({
      id: room.id,
      name: room.name,
      type: room.type,
      price: Number(room.pricePerNight),
      maxGuests: room.maxGuests,
      petsAllowed: room.petsAllowed,
      status: room.status,
      active: room.isActive,
    }))
  );
}

async function listBookings() {
  const bookings = (await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: bookingListSelect,
  })) as ListedBooking[];

  console.table(
    bookings.map((booking: ListedBooking) => ({
      reference: booking.referenceNumber,
      guest: `${booking.firstName} ${booking.lastName}`,
      email: booking.contactEmail,
      status: booking.status,
      payment: booking.paymentStatus,
      total: Number(booking.totalPrice),
      createdAt: booking.createdAt.toISOString(),
    }))
  );
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "reset-bookings":
      await resetBookings();
      break;

    case "activate-rooms":
      await activateAllRooms();
      break;

    case "list-rooms":
      await listRooms();
      break;

    case "list-bookings":
      await listBookings();
      break;

    default:
      console.log(`
Demo Admin Commands:

npm run demo:admin reset-bookings
npm run demo:admin activate-rooms
npm run demo:admin list-rooms
npm run demo:admin list-bookings
`);
  }
}

main()
  .catch((error) => {
    console.error("❌ Demo admin script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });