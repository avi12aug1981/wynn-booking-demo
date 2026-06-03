"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import PrintReservationButton, {
  PRINT_TARGET_ID,
} from "@/features/confirmation/components/PrintReservationButton";
import ReservationDetailsDisplay from "@/features/reservations/components/ReservationDetailsDisplay";
import ReservationPageHero from "@/features/reservations/components/ReservationPageHero";
import {
  mapReservationDetailsToViewModel,
  type ReservationViewModel,
} from "@/features/reservations/lib/reservation-view-model";
import type { PageRouteContext } from "@/features/app-router/route-types";
import {
  formatApiUnreachableMessage,
  formatReservationNotFoundMessage,
  Messages,
} from "@/app/constants/messages";
import { bookingApiConfig } from "@/lib/api/booking-api-config";
import { getBookingByReferenceDotNet } from "@/lib/api/dotnet-booking-client";

type ConfirmationPageProps = PageRouteContext;

export default function ConfirmationPage({ routeParams }: ConfirmationPageProps) {
  const { referenceNumber } = routeParams;

  const [booking, setBooking] = useState<ReservationViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorKind, setErrorKind] = useState<
    "none" | "notFound" | "forbidden" | "unreachable" | "failed"
  >("none");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBooking = useCallback(async () => {
    setIsLoading(true);
    setErrorKind("none");
    setErrorMessage(null);
    setBooking(null);

    try {
      const { response, envelope } =
        await getBookingByReferenceDotNet(referenceNumber);

      if (!response.ok) {
        if (response.status === 503) {
          setErrorKind("unreachable");
          setErrorMessage(
            envelope.message ??
              formatApiUnreachableMessage(bookingApiConfig.dotnetApiUrl)
          );
          return;
        }

        if (response.status === 403 || response.status === 401) {
          setErrorKind("forbidden");
          setErrorMessage(
            envelope.message ?? Messages.Authorization.ViewReservationDenied
          );
          return;
        }

        setErrorKind("notFound");
        return;
      }

      if (!envelope.success || !envelope.data) {
        setErrorKind("notFound");
        return;
      }

      setBooking(mapReservationDetailsToViewModel(envelope.data));
    } catch {
      setErrorKind("failed");
      setErrorMessage(Messages.Confirmation.LoadFailed);
    } finally {
      setIsLoading(false);
    }
  }, [referenceNumber]);

  const loadBookingRef = useRef(loadBooking);
  loadBookingRef.current = loadBooking;

  useEffect(() => {
    void loadBookingRef.current();
  }, [referenceNumber]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f7f4ef] px-6 py-10">
        <p className="text-gray-500 max-w-4xl mx-auto">Loading confirmation…</p>
      </main>
    );
  }

  if (errorKind !== "none" || !booking) {
    const title =
      errorKind === "forbidden"
        ? "Access Denied"
        : errorKind === "unreachable"
          ? "Confirmation Unavailable"
          : errorKind === "failed"
            ? "Unable to Load Confirmation"
            : "Reservation Not Found";

    const detail =
      errorKind === "notFound"
        ? formatReservationNotFoundMessage(referenceNumber)
        : errorMessage;

    return (
      <main className="min-h-screen bg-[#f7f4ef] px-6 py-10">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-sm shadow">
          <p className="uppercase tracking-[0.3em] text-[#8c6b43] text-xs">
            Reservation
          </p>

          <h1 className="font-serif text-4xl mt-3 text-[#3a2418]">{title}</h1>

          <p className="text-gray-600 mt-3">{detail}</p>

          <Link
            href="/search"
            className="inline-block mt-6 bg-[#007a68] text-white px-6 py-3 rounded-sm uppercase tracking-widest text-sm font-semibold"
          >
            Start New Search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <ReservationPageHero printSafe />

      <ReservationDetailsDisplay
        booking={booking}
        contentId={PRINT_TARGET_ID}
        aside={
          <>
            <PrintReservationButton />
            <Link
              href="/search"
              className="block w-full text-center bg-[#007a68] hover:bg-[#006250] text-white px-5 py-3 rounded-sm uppercase tracking-widest text-sm font-semibold print:hidden"
            >
              New Search
            </Link>
          </>
        }
      />
    </main>
  );
}
