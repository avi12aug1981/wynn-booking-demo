"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AppRoutes } from "@/app/constants/routes";
import { isMemberAuthenticated } from "@/app/constants/demo-user";
import AppButton from "@/components/ui/atoms/AppButton";
import {
  BOOKING_STATUS_LABELS,
  cancelBookingDotNet,
  getBookingByReferenceDotNet,
  modifyBookingDotNet,
  type ReservationDetails,
} from "@/lib/api/dotnet-booking-client";

type ReservationManagePanelProps = {
  referenceNumber: string;
  action?: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateInput(value: string) {
  return value.split("T")[0];
}

export default function ReservationManagePanel({
  referenceNumber,
  action,
}: ReservationManagePanelProps) {
  const router = useRouter();
  const isModify = action === "modify";
  const isCancel = action === "cancel";

  const [booking, setBooking] = useState<ReservationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adultCount, setAdultCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    if (!isMemberAuthenticated()) {
      router.replace(AppRoutes.landing);
      return;
    }

    async function loadBooking() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { response, envelope } =
          await getBookingByReferenceDotNet(referenceNumber);

        if (!response.ok || !envelope.success || !envelope.data) {
          setErrorMessage(envelope.message ?? "Reservation not found.");
          return;
        }

        const data = envelope.data;
        setBooking(data);
        setCheckInDate(toDateInput(data.checkInDate));
        setCheckOutDate(toDateInput(data.checkOutDate));
        setAdultCount(data.adultCount ?? 1);
      } catch {
        setErrorMessage("Unable to load reservation.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBooking();
  }, [referenceNumber, router]);

  async function handleModifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setActionMessage(null);

    const { response, envelope } = await modifyBookingDotNet(referenceNumber, {
      checkInDate,
      checkOutDate,
      adultCount,
      specialRequests: specialRequests || undefined,
    });

    setIsSubmitting(false);

    if (!response.ok || !envelope.success) {
      setActionMessage(envelope.message ?? "Unable to modify reservation.");
      return;
    }

    setActionMessage(envelope.data?.message ?? "Reservation updated.");
    router.push(`/reservations/${referenceNumber}`);
  }

  async function handleConfirmCancel() {
    setIsSubmitting(true);
    setActionMessage(null);

    const { response, envelope } = await cancelBookingDotNet(
      referenceNumber,
      cancellationReason || undefined
    );

    setIsSubmitting(false);

    if (!response.ok || !envelope.success) {
      setActionMessage(envelope.message ?? "Unable to cancel reservation.");
      return;
    }

    router.push(AppRoutes.reservations);
  }

  if (isLoading) {
    return (
      <p className="text-gray-500 px-6 py-10">Loading reservation details…</p>
    );
  }

  if (errorMessage || !booking) {
    return (
      <div className="px-6 py-10">
        <p className="text-red-700">{errorMessage ?? "Reservation not found."}</p>
        <Link
          href={AppRoutes.reservations}
          className="inline-block mt-4 text-[#3a2418] underline"
        >
          Back to reservations
        </Link>
      </div>
    );
  }

  const guestCount =
    (booking.adultCount ?? 0) +
    (booking.childCount ?? 0) +
    (booking.infantCount ?? 0);
  const isCancelled = booking.status === 1;
  const statusText = BOOKING_STATUS_LABELS[booking.status] ?? "CONFIRMED";

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      {actionMessage && (
        <div className="mb-6 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="bg-white border rounded-sm shadow-md p-6 space-y-6">
          <div>
            <p className="uppercase tracking-[0.3em] text-[#8c6b43] text-xs">
              Stay Summary
            </p>

            <h2 className="font-serif text-3xl mt-3 text-[#3a2418]">
              {booking.roomName}
            </h2>

            <p className="text-gray-600 mt-1">
              {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}{" "}
              · {guestCount} guests
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t pt-5">
            <div>
              <p className="text-gray-500">Status</p>
              <p
                className={`font-semibold ${
                  isCancelled ? "text-stone-600" : "text-green-700"
                }`}
              >
                {statusText}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Guest</p>
              <p className="font-semibold">
                {booking.firstName} {booking.lastName}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Check-In</p>
              <p className="font-semibold">{formatDate(booking.checkInDate)}</p>
            </div>

            <div>
              <p className="text-gray-500">Check-Out</p>
              <p className="font-semibold">{formatDate(booking.checkOutDate)}</p>
            </div>

            <div>
              <p className="text-gray-500">Total</p>
              <p className="font-semibold">
                ${Number(booking.totalPrice).toFixed(2)}
              </p>
            </div>
          </div>

          {isModify && !isCancelled && (
            <form
              onSubmit={handleModifySubmit}
              className="rounded-sm border border-amber-200 bg-amber-50 p-5 space-y-4 text-amber-900"
            >
              <h3 className="font-semibold">Modify Reservation</h3>

              <p className="text-sm">
                Update stay dates or guest count. Availability and pricing are
                revalidated by the API.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Check-In
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full border rounded-sm px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Check-Out
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full border rounded-sm px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">
                    Adults
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={adultCount}
                    onChange={(e) => setAdultCount(Number(e.target.value))}
                    className="w-full border rounded-sm px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">
                  Special Requests
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full border rounded-sm px-3 py-2 text-sm min-h-[80px]"
                />
              </div>

              <AppButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save Changes"}
              </AppButton>
            </form>
          )}

          {isCancel && !isCancelled && (
            <div className="rounded-sm border border-red-200 bg-red-50 p-5 text-red-800 space-y-4">
              <h3 className="font-semibold">Cancel Reservation</h3>

              <p className="text-sm">
                This action cancels the reservation before check-in. Refund
                status is updated per demo policy.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">
                  Reason (optional)
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full border border-red-200 rounded-sm px-3 py-2 text-sm min-h-[80px]"
                />
              </div>

              <AppButton
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmitting}
                className="!bg-red-700 hover:!bg-red-800"
              >
                {isSubmitting ? "Cancelling…" : "Confirm Cancellation"}
              </AppButton>
            </div>
          )}

          {!isModify && !isCancel && !isCancelled && (
            <div className="rounded-sm border bg-[#faf8f4] p-5 text-sm text-gray-700">
              Use the actions on the right to modify dates and guests or cancel
              this reservation.
            </div>
          )}

          {isCancelled && (
            <div className="rounded-sm border bg-stone-50 p-5 text-sm text-stone-600">
              This reservation has been cancelled and can no longer be modified.
            </div>
          )}
        </div>

        <aside className="bg-white border rounded-sm shadow-md p-6 h-fit space-y-4">
          <h3 className="font-serif text-2xl text-[#3a2418]">
            Reservation Actions
          </h3>

          <Link
            href={AppRoutes.reservations}
            className="block text-center border border-[#3a2418] px-4 py-2 text-sm font-semibold uppercase tracking-widest text-[#3a2418] hover:bg-[#f7f4ef]"
          >
            Back to History
          </Link>

          {!isCancelled && (
            <>
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
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
