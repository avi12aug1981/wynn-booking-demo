"use client";

import { useState } from "react";
import { Hand } from "lucide-react";
import { Messages } from "@/app/constants/messages";
import { createBookingSessionDotNet } from "@/lib/api/dotnet-booking-client";
import AppButton from "@/components/ui/atoms/AppButton";

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
/** Book  Now Button Click Handler */
  async function handleBookNow() {
    setErrorMessage("");
    setIsChecking(true);

    try {
      const { response, envelope } = await createBookingSessionDotNet({
        roomId,
        checkInDate,
        checkOutDate,
        guestCount: Number(guestCount),
      });

      if (!response.ok || !envelope.success || !envelope.data?.redirectUrl) {
        const message =
          envelope.message ?? Messages.Booking.RoomNoLongerAvailable;

        setErrorMessage(message);
        onUnavailable?.(message);
        return;
      }

      window.location.href = envelope.data.redirectUrl;
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

        <AppButton
          type="button"
          variant="link"
          onClick={handleBookNow}
          loading={isChecking}
          loadingText="Retrying"
        >
          Try again
        </AppButton>
      </div>
    );
  }

  return (
    <AppButton
      type="button"
      onClick={handleBookNow}
      loading={isChecking}
      loadingText="Checking"
      icon={<Hand size={16} />}
    >
      Book Now
    </AppButton>
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