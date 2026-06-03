"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppRoutes } from "@/app/constants/routes";
import {
  getMemberProfile,
  isMemberAuthenticated,
  logoutDemoSession,
  type DemoMemberProfile,
} from "@/app/constants/demo-user";
import {
  formatApiUnreachableMessage,
  Messages,
} from "@/app/constants/messages";
import { bookingApiConfig } from "@/lib/api/booking-api-config";
import {
  BOOKING_STATUS_LABELS,
  getMemberBookingsDotNet,
  type MemberBookingSummary,
} from "@/lib/api/dotnet-booking-client";

function formatStayDates(checkIn: string, checkOut: string) {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  return `${new Date(checkIn).toLocaleDateString("en-US", options)} - ${new Date(checkOut).toLocaleDateString("en-US", options)}`;
}

function statusLabel(status: number) {
  const label = BOOKING_STATUS_LABELS[status] ?? "CONFIRMED";
  return label === "CANCELLED" ? "Cancelled" : "Confirmed";
}

export default function ReservationHistoryPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<MemberBookingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [memberProfile, setMemberProfile] = useState<DemoMemberProfile | null>(
    null
  );

  useEffect(() => {
    if (!isMemberAuthenticated()) {
      router.replace(AppRoutes.landing);
      return;
    }

    setMemberProfile(getMemberProfile());

    async function loadBookings() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { response, envelope, bookings: items } =
          await getMemberBookingsDotNet();

        if (response.status === 401 || response.status === 403) {
          logoutDemoSession();
          router.replace(AppRoutes.landing);
          return;
        }

        if (!response.ok || !envelope.success) {
          setErrorMessage(
            envelope.message ?? Messages.Reservations.LoadListFailed
          );
          setBookings([]);
          return;
        }

        setBookings(items);
      } catch {
        setErrorMessage(
          formatApiUnreachableMessage(bookingApiConfig.dotnetApiUrl)
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadBookings();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="bg-[#3a2418] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-xs">
            Member Reservations
          </p>

          <h1 className="font-serif text-4xl mt-4">Reservation History</h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white border rounded-sm shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b bg-[#faf8f4]">
            {memberProfile ? (
              <>
                <p className="text-sm text-gray-500">Signed in as</p>
                <h2 className="font-serif text-2xl text-[#3a2418]">
                  {memberProfile.firstName} {memberProfile.lastName}
                </h2>
                <p className="text-sm text-gray-600">
                  {memberProfile.tier} Member · {memberProfile.email}
                </p>
              </>
            ) : null}
          </div>

          {isLoading && (
            <p className="px-6 py-10 text-gray-500">Loading reservations…</p>
          )}

          {errorMessage && (
            <p className="px-6 py-10 text-red-700">{errorMessage}</p>
          )}

          {!isLoading && !errorMessage && bookings.length === 0 && (
            <p className="px-6 py-10 text-gray-600">No member reservations yet.</p>
          )}

          <div className="divide-y">
            {bookings.map((reservation) => {
              const guestCount =
                reservation.adultCount +
                reservation.childCount +
                reservation.infantCount;
              const isCancelled = reservation.status === 1;

              return (
                <div
                  key={reservation.referenceNumber}
                  className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_0.6fr_1fr] gap-4 px-6 py-5 items-center"
                >
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#8c6b43]">
                      Reference
                    </p>
                    <p className="font-semibold">
                      {reservation.referenceNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {reservation.roomName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500">
                      Stay Dates
                    </p>
                    <p>
                      {formatStayDates(
                        reservation.checkInDate,
                        reservation.checkOutDate
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {guestCount} guests
                    </p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold border ${
                        isCancelled
                          ? "bg-stone-50 text-stone-600 border-stone-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      }`}
                    >
                      {statusLabel(reservation.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link
                      href={`/reservations/${reservation.referenceNumber}`}
                      className="rounded-sm border border-[#3a2418] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#3a2418] hover:bg-[#f7f4ef]"
                    >
                      View
                    </Link>

                    {!isCancelled && (
                      <>
                        <Link
                          href={`/reservations/${reservation.referenceNumber}?action=modify`}
                          className="rounded-sm border border-[#3a2418] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#3a2418] hover:bg-[#f7f4ef]"
                        >
                          Modify
                        </Link>

                        <Link
                          href={`/reservations/${reservation.referenceNumber}?action=cancel`}
                          className="rounded-sm bg-[#3a2418] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[#2b1a11]"
                        >
                          Cancel
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <Link
            href={AppRoutes.search}
            className="inline-flex rounded-sm border border-[#3a2418] px-5 py-3 text-sm font-semibold uppercase tracking-widest text-[#3a2418] hover:bg-white"
          >
            Search New Stay
          </Link>
        </div>
      </section>
    </main>
  );
}
