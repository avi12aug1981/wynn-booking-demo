import { prisma } from "../app/lib/prisma";
import {
  BookingStatus,
  BookingType,
  Gender,
  MemberStatus,
  PaymentStatus,
  RoomStatus,
} from "../app/types/prisma-enums";

async function main() {
  await prisma.booking.deleteMany();
  await prisma.member.deleteMany();
  await prisma.room.deleteMany();

  const deluxeKing = await prisma.room.create({
    data: {
      name: "Deluxe King Room",
      type: "Standard",
      description: "Spacious king room with modern amenities.",
      pricePerNight: 189.99,
      maxGuests: 2,
      amenities: "WiFi,Smart TV,Coffee Maker",
      petsAllowed: false,
      smokingAllowed: false,
      status: RoomStatus.AVAILABLE,
      imageUrl: "/images/deluxe-king.jpg"
    }
  });

  const resortQueen = await prisma.room.create({
    data: {
      name: "Resort Queen Room",
      type: "Standard",
      description: "Comfortable queen room overlooking the resort.",
      pricePerNight: 209.99,
      maxGuests: 4,
      amenities: "WiFi,Smart TV,Mini Fridge",
      petsAllowed: false,
      smokingAllowed: false,
      status: RoomStatus.AVAILABLE,
      imageUrl: "/images/resort-queen.jpg"
    }
  });

  const panoramicKing = await prisma.room.create({
    data: {
      name: "Panoramic King Room",
      type: "Premium",
      description: "Panoramic city views with luxury furnishings.",
      pricePerNight: 259.99,
      maxGuests: 2,
      amenities: "WiFi,Smart TV,City View",
      petsAllowed: false,
      smokingAllowed: false,
      status: RoomStatus.AVAILABLE,
      imageUrl: "/images/panoramic-king.jpg"
    }
  });

  const familyDoubleQueen = await prisma.room.create({
    data: {
      name: "Family Double Queen Room",
      type: "Family",
      description: "Ideal for families with two queen beds.",
      pricePerNight: 279.99,
      maxGuests: 5,
      amenities: "WiFi,Smart TV,Mini Fridge",
      petsAllowed: true,
      smokingAllowed: false,
      status: RoomStatus.AVAILABLE,
      imageUrl: "/images/family-double-queen.jpg"
    }
  });

  const executiveSuite = await prisma.room.create({
    data: {
      name: "Executive Suite",
      type: "Suite",
      description: "Executive suite with separate living area.",
      pricePerNight: 399.99,
      maxGuests: 4,
      amenities: "WiFi,Smart TV,Living Room",
      petsAllowed: false,
      smokingAllowed: false,
      status: RoomStatus.AVAILABLE,
      imageUrl: "/images/executive-suite.jpg"
    }
  });

  const towerSuite = await prisma.room.create({
    data: {
      name: "Tower Suite",
      type: "Suite",
      description: "Luxury suite with premium tower views.",
      pricePerNight: 549.99,
      maxGuests: 4,
      amenities: "WiFi,Smart TV,Premium View",
      petsAllowed: false,
      smokingAllowed: false,
      status: RoomStatus.AVAILABLE,
      imageUrl: "/images/tower-suite.jpg"
    }
  });

  await prisma.room.create({
    data: {
      name: "Salon Suite",
      type: "Suite",
      description: "Elegant suite designed for extended stays.",
      pricePerNight: 799.99,
      maxGuests: 6,
      amenities: "WiFi,Smart TV,Dining Area",
      petsAllowed: false,
      smokingAllowed: false,
      status: RoomStatus.AVAILABLE,
      imageUrl: "/images/salon-suite.jpg"
    }
  });

  await prisma.room.create({
    data: {
      name: "Presidential Suite",
      type: "Luxury",
      description: "Premier luxury accommodation experience.",
      pricePerNight: 1299.99,
      maxGuests: 8,
      amenities: "WiFi,Smart TV,Private Lounge",
      petsAllowed: false,
      smokingAllowed: false,
      status: RoomStatus.AVAILABLE,
      imageUrl: "/images/presidential-suite.jpg"
    }
  });

  const member = await prisma.member.create({
    data: {
      firstName: "Demo",
      lastName: "Member",
      email: "member@demo.com",
      gender: Gender.MALE,
      status: MemberStatus.ACTIVE,
      addressLine1: "123 Paradise Road",
      city: "Las Vegas",
      state: "NV",
      zipCode: "89109",
      country: "USA"
    }
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);

  await prisma.booking.create({
    data: {
      referenceNumber: "WYNN100001",
      roomId: deluxeKing.id,
      memberId: member.id,
      bookingType: BookingType.MEMBER,
      firstName: "Demo",
      lastName: "Member",
      gender: Gender.MALE,
      contactEmail: "member@demo.com",
      adultCount: 2,
      childCount: 0,
      infantCount: 0,
      petCount: 0,
      checkInDate: tomorrow,
      checkOutDate: threeDaysLater,
      addressLine1: "123 Paradise Road",
      city: "Las Vegas",
      state: "NV",
      zipCode: "89109",
      country: "USA",
      pricePerNight: 189.99,
      numberOfNights: 3,
      discountAmount: 0,
      taxAmount: 45,
      totalPrice: 614.97,
      paymentStatus: PaymentStatus.PAID,
      paymentTransactionId: "TXN100001",
      status: BookingStatus.CONFIRMED,
      confirmationEmailSent: true
    }
  });

  console.log("Seed data created successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });