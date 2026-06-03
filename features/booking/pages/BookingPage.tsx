import Image from "next/image";
import { redirect } from "next/navigation";
import { hasBookingQueryParams } from "@/app/lib/booking-query-params";
import { ApplicationConstants } from "@/app/constants";
import { buildBookingUrl } from "@/app/constants/routes";
import { BookingErrors } from "@/app/constants/booking-errors";
import { buildLoginUrl } from "@/app/constants/routes";
import BookingForm from "@/features/booking/components/BookingForm";
import type { PageRouteContext } from "@/features/app-router/route-types";
import Link from "next/link";
import {
  getBookingSessionDotNet,
  mapDotNetSessionForBookingPage,
} from "@/lib/api/dotnet-booking-client";

type BookingPageProps = PageRouteContext;

function calculateNumberOfNights(checkInDate: string, checkOutDate: string) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / millisecondsPerDay
  );
}

export default async function BookingPage({
  routeParams,
  searchParams,
}: BookingPageProps) {
  const { token } = routeParams;

  if (hasBookingQueryParams(searchParams)) {
    redirect(buildBookingUrl(token));
  }

  const { response, envelope } = await getBookingSessionDotNet(token);

  if (!response.ok || !envelope.success || !envelope.data) {
    if (response.status === 404) {
      redirect(buildLoginUrl(BookingErrors.SessionNotFound));
    }

    if (envelope.message?.toLowerCase().includes("expired")) {
      redirect(buildLoginUrl(BookingErrors.SessionExpired));
    }

    redirect(buildLoginUrl(BookingErrors.SessionInvalid));
  }

  const session = mapDotNetSessionForBookingPage({
    ...envelope.data,
    guestCount: envelope.data.guestCount,
  });
  const room = session.room;

  const numberOfNights = calculateNumberOfNights(
    session.checkInDate,
    session.checkOutDate
  );

  const nightlyRate = Number(room.pricePerNight);
  const roomSubtotal = nightlyRate * numberOfNights;
  const taxAmount = Number(
    (roomSubtotal * ApplicationConstants.TaxRate).toFixed(2)
  );
  const resortFee = 0;
  const discountAmount = 0;

  const totalAmount = Number(
    (roomSubtotal + taxAmount + resortFee - discountAmount).toFixed(2)
  );

  const checkInDateLabel = session.checkInDate.split("T")[0];
  const checkOutDateLabel = session.checkOutDate.split("T")[0];

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="bg-[#3a2418] text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-xs">
            Secure Reservation
          </p>

          <h1 className="font-serif text-3xl mt-2">Complete Your Stay</h1>

          <p className="text-stone-200 mt-1 text-sm">
            Complete your reservation within{" "}
            {ApplicationConstants.BookingSessionTimeoutMinutes} minutes. This
            session secures your checkout link but does not hold the room until
            booking is confirmed.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <BookingForm
            bookingSessionToken={token}
            roomId={room.id}
            maxGuests={room.maxGuests}
            petsAllowed={room.petsAllowed}
            defaultCheckInDate={checkInDateLabel}
            defaultCheckOutDate={checkOutDateLabel}
            defaultGuestCount={session.guestCount}
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
                  Government-issued photo ID is required at check-in. Room
                  preferences and upgrades are subject to availability.
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
                <div className="flex justify-between">
                  <span>Check-In</span>
                  <span>{checkInDateLabel}</span>
                </div>

                <div className="flex justify-between">
                  <span>Check-Out</span>
                  <span>{checkOutDateLabel}</span>
                </div>

                <div className="flex justify-between">
                  <span>Nights</span>
                  <span>{numberOfNights}</span>
                </div>

                <div className="flex justify-between">
                  <span>Guests</span>
                  <span>{session.guestCount}</span>
                </div>
                <Link
                  href={`/search?checkInDate=${checkInDateLabel}&checkOutDate=${checkOutDateLabel}&guestCount=${session.guestCount}`}
                  className="block mt-4 text-center border border-[#3a2418] text-[#3a2418] px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-widest hover:bg-[#f7f4ef]"
                >
                  Modify Search
                </Link>
              </div>

              <div className="mt-6 border-t pt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>
                    ${nightlyRate.toFixed(2)} × {numberOfNights}
                  </span>
                  <span>${roomSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Resort Fee</span>
                  <span>${resortFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>

                <div className="border-t pt-4 flex justify-between text-lg font-semibold">
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
