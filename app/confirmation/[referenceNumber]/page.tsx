import Image from "next/image";
import Link from "next/link";
import PrintReservationButton from "@/app/components/PrintReservationButton";

type ConfirmationPageProps = {
  params: Promise<{
    referenceNumber: string;
  }>;
};

async function getBooking(referenceNumber: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/bookings/${referenceNumber}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.data;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { referenceNumber } = await params;

  const booking = await getBooking(referenceNumber);

  if (!booking) {
    return (
      <main className="min-h-screen bg-[#f7f4ef] px-6 py-10">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-sm shadow">
          <p className="uppercase tracking-[0.3em] text-[#8c6b43] text-xs">
            Reservation
          </p>

          <h1 className="font-serif text-4xl mt-3 text-[#3a2418]">
            Reservation Not Found
          </h1>

          <p className="text-gray-600 mt-3">
            Unable to locate reservation {referenceNumber}.
          </p>

          <Link
            href="/"
            className="inline-block mt-6 bg-[#007a68] text-white px-6 py-3 rounded-sm uppercase tracking-widest text-sm font-semibold"
          >
            Start New Search
          </Link>
        </div>
      </main>
    );
  }

  const guestCount =
    booking.adultCount + booking.childCount + booking.infantCount;

  const nightlyRate = Number(booking.pricePerNight);
  const discountAmount = Number(booking.discountAmount);
  const taxAmount = Number(booking.taxAmount);
  const totalAmount = Number(booking.totalPrice);
  const roomSubtotal = nightlyRate * booking.numberOfNights;

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="bg-[#3a2418] text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-xs">
            Reservation Confirmed
          </p>

          <h1 className="font-serif text-4xl mt-3">
            Thank You For Your Reservation
          </h1>

          <p className="text-stone-200 mt-2">
            Your stay has been successfully reserved.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="bg-white rounded-sm shadow-md border border-stone-200 p-8">
            <div className="border-b pb-6 mb-6">
              <p className="uppercase tracking-[0.3em] text-[#8c6b43] text-xs">
                Confirmation Number
              </p>

              <h2 className="font-serif text-4xl mt-2 text-[#3a2418]">
                {booking.referenceNumber}
              </h2>

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">
                  {booking.status}
                </span>

                <span className="bg-stone-50 text-stone-700 border border-stone-200 px-3 py-1 rounded-full">
                  Payment: {booking.paymentStatus}
                </span>

                <span className="bg-stone-50 text-stone-700 border border-stone-200 px-3 py-1 rounded-full">
                  Email:{" "}
                  {booking.confirmationEmailSent ? "Sent" : "Pending"}
                </span>
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
                  <p>{booking.addressLine1}</p>
                  {booking.addressLine2 && <p>{booking.addressLine2}</p>}
                  <p>
                    {booking.city}, {booking.state} {booking.zipCode}
                  </p>
                  <p>{booking.country}</p>
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
                      {formatDate(booking.checkInDate)} · 3:00 PM
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Check-Out</span>
                    <span className="font-medium text-right">
                      {formatDate(booking.checkOutDate)} · 11:00 AM
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Nights</span>
                    <span className="font-medium">
                      {booking.numberOfNights}
                    </span>
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

            {booking.guests?.length > 0 && (
              <section className="border-t mt-8 pt-6">
                <h3 className="font-serif text-2xl text-[#3a2418]">
                  Registered Guests
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {booking.guests.map(
                    (guest: {
                      id: number;
                      sequence: number;
                      firstName: string;
                      lastName: string;
                      ageGroup: string;
                    }) => (
                      <div
                        key={guest.id}
                        className="border rounded-sm p-4 bg-[#faf8f4]"
                      >
                        <p className="font-medium">
                          Guest {guest.sequence}: {guest.firstName}{" "}
                          {guest.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {guest.ageGroup}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {booking.specialRequests && (
              <section className="border-t mt-8 pt-6">
                <h3 className="font-serif text-2xl text-[#3a2418]">
                  Special Requests
                </h3>

                <p className="text-gray-700 mt-3">
                  {booking.specialRequests}
                </p>
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
                    ${nightlyRate.toFixed(2)} × {booking.numberOfNights} night
                    {booking.numberOfNights === 1 ? "" : "s"}
                  </span>
                  <span>${roomSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>

                <div className="border-t pt-4 flex justify-between text-lg font-semibold text-[#3a2418]">
                  <span>Total Paid</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
              <PrintReservationButton />

                <Link
                  href="/"
                  className="block text-center bg-[#007a68] hover:bg-[#006250] text-white px-5 py-3 rounded-sm uppercase tracking-widest text-sm font-semibold"
                >
                  New Search
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}