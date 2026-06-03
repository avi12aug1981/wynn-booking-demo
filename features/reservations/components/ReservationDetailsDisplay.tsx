import Image from "next/image";
import type { ReactNode } from "react";
import {
  formatCityStateZip,
  formatReservationDate,
  type ReservationViewModel,
} from "@/features/reservations/lib/reservation-view-model";

type ReservationDetailsDisplayProps = {
  booking: ReservationViewModel;
  /** Optional id for print anchor (confirmation page). */
  contentId?: string;
  referenceLabel?: string;
  showEmailStatus?: boolean;
  aside?: ReactNode;
  children?: ReactNode;
};

export default function ReservationDetailsDisplay({
  booking,
  contentId,
  referenceLabel = "Confirmation Number",
  showEmailStatus = true,
  aside,
  children,
}: ReservationDetailsDisplayProps) {
  const guestCount =
    booking.adultCount + booking.childCount + booking.infantCount;
  const cityStateZip = formatCityStateZip(
    booking.city,
    booking.state,
    booking.zipCode
  );
  const roomSubtotal = booking.pricePerNight * booking.numberOfNights;
  const isCancelled = booking.statusLabel === "CANCELLED";

  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div
          id={contentId}
          className="bg-white rounded-sm shadow-md border border-stone-200 p-8"
        >
          <div className="border-b pb-6 mb-6">
            <p className="uppercase tracking-[0.3em] text-[#8c6b43] text-xs">
              {referenceLabel}
            </p>

            <h2 className="font-serif text-4xl mt-2 text-[#3a2418]">
              {booking.referenceNumber}
            </h2>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span
                className={`px-3 py-1 rounded-full border ${
                  isCancelled
                    ? "bg-stone-50 text-stone-700 border-stone-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {booking.statusLabel}
              </span>

              <span className="bg-stone-50 text-stone-700 border border-stone-200 px-3 py-1 rounded-full">
                Payment: {booking.paymentStatusLabel}
              </span>

              {showEmailStatus && (
                <span className="bg-stone-50 text-stone-700 border border-stone-200 px-3 py-1 rounded-full">
                  Email:{" "}
                  {booking.confirmationEmailSent ? "Sent" : "Pending"}
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <section>
              <h3 className="font-serif text-2xl text-[#3a2418]">
                Guest Information
              </h3>

              <div className="space-y-2 text-gray-700 mt-4">
                <p className="font-medium">
                  {booking.firstName} {booking.lastName}
                </p>
                <p>{booking.contactEmail}</p>
                {booking.addressLine1.trim() && <p>{booking.addressLine1}</p>}
                {booking.addressLine2?.trim() && <p>{booking.addressLine2}</p>}
                {cityStateZip && <p>{cityStateZip}</p>}
                {booking.country.trim() && <p>{booking.country}</p>}
              </div>
            </section>

            <section>
              <h3 className="font-serif text-2xl text-[#3a2418]">
                Stay Information
              </h3>

              <div className="space-y-3 text-gray-700 mt-4">
                <div className="flex justify-between gap-4">
                  <span>Room</span>
                  <span className="font-medium text-right">
                    {booking.room.name}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Check-In</span>
                  <span className="font-medium text-right">
                    {formatReservationDate(booking.checkInDate)} · 3:00 PM
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Check-Out</span>
                  <span className="font-medium text-right">
                    {formatReservationDate(booking.checkOutDate)} · 11:00 AM
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Nights</span>
                  <span className="font-medium">{booking.numberOfNights}</span>
                </div>

                <div className="flex justify-between">
                  <span>Guests</span>
                  <span className="font-medium">{guestCount}</span>
                </div>

                <div className="flex justify-between">
                  <span>Pets</span>
                  <span className="font-medium">{booking.petCount}</span>
                </div>
              </div>
            </section>
          </div>

          {booking.specialRequests && (
            <section className="border-t mt-8 pt-6">
              <h3 className="font-serif text-2xl text-[#3a2418]">
                Special Requests
              </h3>

              <p className="text-gray-700 mt-3">{booking.specialRequests}</p>
            </section>
          )}

          <section className="border-t mt-8 pt-6">
            <h3 className="font-serif text-2xl text-[#3a2418]">
              Arrival Information
            </h3>

            <div className="bg-[#f7f4ef] border border-stone-200 p-4 text-sm text-stone-700 mt-4 leading-relaxed">
              Check-in begins at 3:00 PM. Check-out is at 11:00 AM.
              Government-issued photo ID is required at check-in. Room
              preferences and upgrades are subject to availability.
            </div>
          </section>

          {children}
        </div>

        <aside className="bg-white rounded-sm shadow-md border border-stone-200 h-fit overflow-hidden lg:sticky lg:top-6">
          <Image
            src={booking.room.imageUrl || "/images/default-room.jpg"}
            alt={booking.room.name}
            width={800}
            height={450}
            className="w-full h-48 object-cover"
          />

          <div className="p-6">
            <p className="uppercase tracking-[0.3em] text-[#8c6b43] text-xs">
              Payment Summary
            </p>

            <h3 className="font-serif text-3xl mt-3 text-[#3a2418]">
              {booking.room.name}
            </h3>

            <div className="mt-6 border-t pt-5 space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>
                  ${booking.pricePerNight.toFixed(2)} × {booking.numberOfNights}{" "}
                  night{booking.numberOfNights === 1 ? "" : "s"}
                </span>
                <span>${roomSubtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>
                <span>-${booking.discountAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span>${booking.taxAmount.toFixed(2)}</span>
              </div>

              <div className="border-t pt-4 flex justify-between text-lg font-semibold text-[#3a2418]">
                <span>Total Paid</span>
                <span>${booking.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {aside && <div className="mt-6 space-y-3">{aside}</div>}
          </div>
        </aside>
      </div>
    </section>
  );
}
