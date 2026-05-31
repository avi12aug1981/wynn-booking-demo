"use client";

import { useState } from "react";
import { Hand } from "lucide-react";
import { Messages } from "@/app/constants/messages";

type BookNowButtonProps = {
  roomId: number;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: string;
  onUnavailable?: (message: string) => void;
};

type ReadyBookNowButtonProps = {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: string;
  onUnavailable?: (message: string) => void;
};

function ReadyBookNowButton({
  roomId,
  checkInDate,
  checkOutDate,
  guestCount,
  onUnavailable,
}: ReadyBookNowButtonProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function handleBookNow() {
    setErrorMessage("");
    setIsChecking(true);

    try {
      const response = await fetch("/api/booking-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          checkInDate,
          checkOutDate,
          guestCount: Number(guestCount),
        }),
        cache: "no-store",
      });

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: { redirectUrl?: string };
      };

      if (!response.ok || !result.success || !result.data?.redirectUrl) {
        const message =
          result.message ?? Messages.Booking.RoomNoLongerAvailable;

        setErrorMessage(message);
        onUnavailable?.(message);
        return;
      }

      window.location.href = result.data.redirectUrl;
    } catch {
      const message = Messages.Common.UnexpectedError;
      setErrorMessage(message);
      onUnavailable?.(message);
    } finally {
      setIsChecking(false);
    }
  }

  if (errorMessage) {
    return (
      <div className="max-w-xs space-y-2">
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {errorMessage}
        </div>
        <button
          type="button"
          onClick={handleBookNow}
          disabled={isChecking}
          className="text-xs font-medium uppercase tracking-wide text-[#007a68] underline-offset-2 hover:underline disabled:opacity-60"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBookNow}
      disabled={isChecking}
      className="group inline-flex min-w-[140px] cursor-pointer items-center justify-center gap-2 bg-[#007a68] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-all hover:bg-[#006250] rounded-sm disabled:cursor-wait disabled:opacity-70"
    >
      {isChecking ? "Checking..." : "Book Now"}
      {!isChecking && (
        <Hand size={16} className="transition-transform group-hover:scale-125" />
      )}
    </button>
  );
}

export default function BookNowButton({
  roomId,
  checkInDate,
  checkOutDate,
  guestCount,
  onUnavailable,
}: BookNowButtonProps) {
  if (!checkInDate || !checkOutDate || !guestCount) {
    return (
      <p className="max-w-xs text-xs leading-relaxed text-red-700 bg-red-50 border border-red-200 rounded-sm p-2">
        Run a room search before booking.
      </p>
    );
  }

  return (
    <ReadyBookNowButton
      roomId={roomId}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      guestCount={guestCount}
      onUnavailable={onUnavailable}
    />
  );
}
