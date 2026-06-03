"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AppRoutes } from "@/app/constants/routes";
import { isMemberAuthenticated } from "@/app/constants/demo-user";
import {
  formatApiUnreachableMessage,
  formatReservationNotFoundMessage,
  Messages,
} from "@/app/constants/messages";
import { bookingApiConfig } from "@/lib/api/booking-api-config";
import {
  areStayDatesValid,
  isBeforeToday,
  todayDateInputValue,
} from "@/app/lib/utils/date";
import AppButton from "@/components/ui/atoms/AppButton";
import ReservationDetailsDisplay from "@/features/reservations/components/ReservationDetailsDisplay";
import { mapReservationDetailsToViewModel } from "@/features/reservations/lib/reservation-view-model";
import {
  cancelBookingDotNet,
  getMemberBookingForManageDotNet,
  modifyBookingDotNet,
  type ReservationDetails,
} from "@/lib/api/dotnet-booking-client";

type ReservationManagePanelProps = {
  referenceNumber: string;
  action?: string;
};

const actionLinkClassName =
  "block w-full text-center border border-[#3a2418] text-[#3a2418] px-5 py-3 rounded-sm uppercase tracking-widest text-sm font-semibold hover:bg-[#f7f4ef]";

const actionLinkPrimaryClassName =
  "block w-full text-center bg-[#3a2418] px-5 py-3 rounded-sm uppercase tracking-widest text-sm font-semibold text-white hover:bg-[#2b1a11]";

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

  const loadBooking = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    setErrorMessage(null);

    try {
      const { response, envelope } =
        await getMemberBookingForManageDotNet(referenceNumber);

      if (response.status === 403 || response.status === 401) {
        setErrorMessage(
          envelope.message ?? Messages.Authorization.ViewReservationDenied
        );
        setBooking(null);
        return;
      }

      if (!response.ok || !envelope.success || !envelope.data) {
        setErrorMessage(
          envelope.message ??
            formatReservationNotFoundMessage(referenceNumber)
        );
        setBooking(null);
        return;
      }

      const data = envelope.data;
      setBooking(data);
      setCheckInDate(toDateInput(data.checkInDate));
      setCheckOutDate(toDateInput(data.checkOutDate));
      setAdultCount(data.adultCount ?? 1);
      setSpecialRequests(data.specialRequests ?? "");
    } catch (error) {
      console.error("Failed to load reservation.", referenceNumber, error);
      setErrorMessage(Messages.Reservations.LoadReservationFailed);
      setBooking(null);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [referenceNumber]);

  const loadBookingRef = useRef(loadBooking);
  loadBookingRef.current = loadBooking;

  useEffect(() => {
    if (!isMemberAuthenticated()) {
      router.replace(AppRoutes.landing);
      return;
    }

    void loadBookingRef.current(true);
  }, [referenceNumber, router]);

  const today = todayDateInputValue();

  async function handleModifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setActionMessage(null);

    if (!areStayDatesValid(checkInDate, checkOutDate)) {
      setActionMessage(
        isBeforeToday(checkInDate)
          ? Messages.Booking.CheckInDateCannotBePast
          : Messages.Booking.CheckoutMustBeAfterCheckin
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const { response, envelope } = await modifyBookingDotNet(referenceNumber, {
        checkInDate,
        checkOutDate,
        adultCount,
        specialRequests: specialRequests.trim() || undefined,
      });

      if (!response.ok || !envelope.success) {
        setActionMessage(
          envelope.message ?? Messages.Reservations.ModifyFailed
        );
        setIsSubmitting(false);
        return;
      }

      router.replace(`/reservations/${referenceNumber}`);
    } catch {
      setActionMessage(
        formatApiUnreachableMessage(bookingApiConfig.dotnetApiUrl)
      );
    }

    setIsSubmitting(false);
  }

  async function handleConfirmCancel() {
    setIsSubmitting(true);
    setActionMessage(null);

    try {
      const { response, envelope } = await cancelBookingDotNet(
        referenceNumber,
        cancellationReason.trim() || undefined
      );

      if (!response.ok || !envelope.success) {
        setActionMessage(
          envelope.message ?? Messages.Reservations.CancelFailed
        );
        setIsSubmitting(false);
        return;
      }

      router.push(AppRoutes.reservations);
    } catch {
      setActionMessage(
        formatApiUnreachableMessage(bookingApiConfig.dotnetApiUrl)
      );
    }

    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
      <p className="text-gray-500 px-6 py-10 max-w-6xl mx-auto">
        Loading reservation details…
      </p>
    );
  }

  if (errorMessage || !booking) {
    return (
      <div className="px-6 py-10 max-w-6xl mx-auto">
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

  const viewModel = mapReservationDetailsToViewModel(booking);
  const isCancelled = booking.status === 1;

  return (
    <ReservationDetailsDisplay
      booking={viewModel}
      referenceLabel="Reservation Number"
      aside={
        <>
          <Link href={AppRoutes.reservations} className={actionLinkClassName}>
            Back to History
          </Link>

          {!isCancelled && !isModify && !isCancel && (
            <>
              <Link
                href={`/reservations/${referenceNumber}?action=modify`}
                className={actionLinkClassName}
              >
                Modify
              </Link>

              <Link
                href={`/reservations/${referenceNumber}?action=cancel`}
                className={actionLinkPrimaryClassName}
              >
                Cancel
              </Link>
            </>
          )}

          {(isModify || isCancel) && (
            <Link
              href={`/reservations/${referenceNumber}`}
              className={actionLinkClassName}
            >
              View Details
            </Link>
          )}
        </>
      }
    >
      {isModify && !isCancelled && (
        <form
          onSubmit={handleModifySubmit}
          className="border-t mt-8 pt-6 rounded-sm border border-amber-200 bg-amber-50 p-5 space-y-4 text-amber-900"
        >
          <h3 className="font-serif text-2xl text-[#3a2418]">Modify Reservation</h3>

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
                min={today}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full border rounded-sm px-3 py-2 text-sm bg-white"
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
                min={checkInDate || today}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full border rounded-sm px-3 py-2 text-sm bg-white"
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
                className="w-full border rounded-sm px-3 py-2 text-sm bg-white"
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
              className="w-full border rounded-sm px-3 py-2 text-sm min-h-[80px] bg-white"
            />
          </div>

          {actionMessage && (
            <p className="text-sm font-medium text-red-800">{actionMessage}</p>
          )}

          <AppButton type="submit" loading={isSubmitting} loadingText="Saving…">
            Save Changes
          </AppButton>
        </form>
      )}

      {isCancel && !isCancelled && (
        <div className="border-t mt-8 pt-6 rounded-sm border border-red-200 bg-red-50 p-5 text-red-800 space-y-4">
          <h3 className="font-serif text-2xl text-[#3a2418]">Cancel Reservation</h3>

          <p className="text-sm">
            This action cancels the reservation before check-in. Refund status
            is updated per demo policy.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">
              Reason (optional)
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full border border-red-200 rounded-sm px-3 py-2 text-sm min-h-[80px] bg-white"
            />
          </div>

          {actionMessage && (
            <p className="text-sm font-medium">{actionMessage}</p>
          )}

          <AppButton
            type="button"
            onClick={handleConfirmCancel}
            loading={isSubmitting}
            loadingText="Cancelling…"
            className="!bg-red-700 hover:!bg-red-800"
          >
            Confirm Cancellation
          </AppButton>
        </div>
      )}

      {isCancelled && (
        <div className="border-t mt-8 pt-6 rounded-sm border bg-stone-50 p-5 text-sm text-stone-600">
          This reservation has been cancelled and can no longer be modified.
        </div>
      )}
    </ReservationDetailsDisplay>
  );
}
