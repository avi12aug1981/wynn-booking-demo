import Image from "next/image";
import { redirect } from "next/navigation";
import BookingForm from "../components/BookingForm";
import { prisma } from "@/app/lib/prisma";
import {
  isBeforeToday,
  isCheckOutAfterCheckIn,
  isValidDateString,
} from "@/app/lib/utils/date";

type BookingPageProps = {
  searchParams: Promise<{
    roomId?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: string;
  }>;
};

function calculateNumberOfNights(checkInDate: string, checkOutDate: string) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.ceil(
    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
      millisecondsPerDay
  );
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;

  const roomId = Number(params.roomId);
  const guestCount = Number(params.guestCount);

  const invalidRoomId = !params.roomId || !Number.isInteger(roomId) || roomId <= 0;
  const invalidGuestCount =
    !params.guestCount || !Number.isInteger(guestCount) || guestCount < 1;

  const invalidDates =
    !isValidDateString(params.checkInDate) ||
    !isValidDateString(params.checkOutDate) ||
    !isCheckOutAfterCheckIn(params.checkInDate!, params.checkOutDate!) ||
    isBeforeToday(params.checkInDate!);

  if (invalidRoomId || invalidGuestCount || invalidDates) {
    redirect("/?bookingError=invalid-selection");
  }

  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      isActive: true,
    },
  });

  if (!room) {
    redirect("/?bookingError=room-not-found");
  }

  const numberOfNights = calculateNumberOfNights(
    params.checkInDate!,
    params.checkOutDate!
  );
  const nightlyRate = Number(room.pricePerNight);
  const roomSubtotal = nightlyRate * numberOfNights;
  const discountAmount = 0;
  const resortFee = 0;
  const taxAmount = Number((roomSubtotal * 0.13).toFixed(2));
  const totalAmount = Number(
    (roomSubtotal - discountAmount + resortFee + taxAmount).toFixed(2)
  );

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
     <section className="bg-[#3a2418] text-white">
     <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-sm">
            Secure Reservation
          </p>

          <h1 className="font-serif text-3xl mt-2">Complete Your Stay</h1>

          <p className="text-stone-200 mt-1 max-w-2xl text-sm">
            Enter guest details and confirm your reservation with our secure
            simulated checkout.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <BookingForm
  roomId={roomId}
  defaultCheckInDate={params.checkInDate}
  defaultCheckOutDate={params.checkOutDate}
  defaultGuestCount={guestCount}
  petsAllowed={room.petsAllowed}
/>
          <aside className="bg-white rounded-sm shadow-md border border-stone-200 h-fit lg:sticky lg:top-6 overflow-hidden">
            <Image
              src={room.imageUrl || "/images/default-room.jpg"}
              alt={room.name}
              width={800}
              height={450}
              className="w-full h-48 object-cover"
            />
<div className="bg-[#f7f4ef] border-b border-stone-200 px-5 py-4">
  <div className="space-y-2 text-xs text-stone-700">
    <div className="flex justify-between">
      <span>Check-In Time</span>
      <span className="font-medium">3:00 PM</span>
    </div>

    <div className="flex justify-between">
      <span>Check-Out Time</span>
      <span className="font-medium">11:00 AM</span>
    </div>

    <div className="pt-2 border-t border-stone-200 text-[11px] leading-relaxed">
      Government-issued photo ID is required at check-in.
      Room preferences and upgrades are subject to availability.
    </div>
  </div>
</div>
            <div className="p-6">
              <p className="uppercase tracking-[0.3em] text-[#8c6b43] text-xs">
                Reservation Summary
              </p>

              <h2 className="font-serif text-3xl mt-3 text-[#3a2418]">
                {room.name}
              </h2>

              <p className="text-sm text-gray-600 mt-1">{room.type}</p>

              <div className="mt-5 space-y-3 text-sm text-gray-700 border-t pt-5">
                <div className="flex justify-between gap-4">
                  <span>Check-In</span>
                  <span className="font-medium text-right">
                    {params.checkInDate} · 3:00 PM
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Check-Out</span>
                  <span className="font-medium text-right">
                    {params.checkOutDate} · 11:00 AM
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Nights</span>
                  <span className="font-medium">{numberOfNights}</span>
                </div>

                <div className="flex justify-between">
                  <span>Guests</span>
                  <span className="font-medium">{guestCount}</span>
                </div>
              </div>

              <div className="mt-6 border-t pt-5 space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>
                    ${nightlyRate.toFixed(2)} × {numberOfNights} night
                    {numberOfNights === 1 ? "" : "s"}
                  </span>
                  <span>${roomSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Resort Fee</span>
                  <span>${resortFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>

                <div className="border-t pt-4 flex justify-between text-lg font-semibold text-[#3a2418]">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

             
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}