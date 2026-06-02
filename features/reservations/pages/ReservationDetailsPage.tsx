import Link from "next/link";
import type { PageRouteContext } from "@/features/app-router/route-types";

type ReservationDetailsPageProps = PageRouteContext;

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ReservationDetailsPage({
  routeParams,
  searchParams,
}: ReservationDetailsPageProps) {
  const { referenceNumber } = routeParams;
  const action = getSingleQueryValue(searchParams.action);

  const isModify = action === "modify";
  const isCancel = action === "cancel";

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="bg-[#3a2418] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-xs">
            Reservation Management
          </p>

          <h1 className="font-serif text-4xl mt-4">
            {isModify
              ? "Modify Reservation"
              : isCancel
                ? "Cancel Reservation"
                : "Reservation Details"}
          </h1>

          <p className="text-stone-200 mt-3 max-w-2xl">
            Reference Number: {referenceNumber}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="bg-white border rounded-sm shadow-md p-6 space-y-6">
            <div>
              <p className="uppercase tracking-[0.3em] text-[#8c6b43] text-xs">
                Stay Summary
              </p>

              <h2 className="font-serif text-3xl mt-3 text-[#3a2418]">
                Resort King
              </h2>

              <p className="text-gray-600 mt-1">
                Jun 4, 2026 - Jun 6, 2026 · 2 guests
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t pt-5">
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-semibold text-green-700">Confirmed</p>
              </div>

              <div>
                <p className="text-gray-500">Member</p>
                <p className="font-semibold">Avadesh Demo Member</p>
              </div>

              <div>
                <p className="text-gray-500">Check-In</p>
                <p className="font-semibold">Jun 4, 2026</p>
              </div>

              <div>
                <p className="text-gray-500">Check-Out</p>
                <p className="font-semibold">Jun 6, 2026</p>
              </div>
            </div>

            {isModify && (
              <div className="rounded-sm border border-amber-200 bg-amber-50 p-5 text-amber-900">
                <h3 className="font-semibold">Modification Workflow</h3>

                <p className="text-sm mt-2">
                  Changing stay dates, room type, or guest count requires the
                  system to re-check room availability and pricing.
                </p>

                <Link
                  href="/?checkInDate=2026-06-04&checkOutDate=2026-06-06&guestCount=2"
                  className="inline-flex mt-4 rounded-sm bg-[#3a2418] px-4 py-2 text-sm font-semibold uppercase tracking-widest text-white hover:bg-[#2b1a11]"
                >
                  Recheck Availability
                </Link>
              </div>
            )}

            {isCancel && (
              <div className="rounded-sm border border-red-200 bg-red-50 p-5 text-red-800">
                <h3 className="font-semibold">Cancellation Workflow</h3>

                <p className="text-sm mt-2">
                  Cancellation validates reservation status, policy eligibility,
                  and audit requirements before updating the booking status.
                </p>

                <button
                  type="button"
                  className="mt-4 rounded-sm bg-red-700 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-white hover:bg-red-800"
                >
                  Confirm Cancellation
                </button>
              </div>
            )}

            {!isModify && !isCancel && (
              <div className="rounded-sm border bg-[#faf8f4] p-5 text-sm text-gray-700">
                This page demonstrates the member reservation management
                journey. A member can view reservation details, start a modify
                flow, or initiate cancellation.
              </div>
            )}
          </div>

          <aside className="bg-white border rounded-sm shadow-md p-6 h-fit space-y-4">
            <h3 className="font-serif text-2xl text-[#3a2418]">
              Reservation Actions
            </h3>

            <Link
              href="/reservations"
              className="block text-center border border-[#3a2418] px-4 py-2 text-sm font-semibold uppercase tracking-widest text-[#3a2418] hover:bg-[#f7f4ef]"
            >
              Back to History
            </Link>

            <Link
              href={`/reservations/${referenceNumber}?action=modify`}
              className="block text-center border border-[#3a2418] px-4 py-2 text-sm font-semibold uppercase tracking-widest text-[#3a2418] hover:bg-[#f7f4ef]"
            >
              Modify
            </Link>

            <Link
              href={`/reservations/${referenceNumber}?action=cancel`}
              className="block text-center bg-[#3a2418] px-4 py-2 text-sm font-semibold uppercase tracking-widest text-white hover:bg-[#2b1a11]"
            >
              Cancel
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}