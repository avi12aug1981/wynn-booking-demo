"use client";

import { useState } from "react";
import { Hand } from "lucide-react";
import { areStayDatesValid } from "@/app/lib/utils/date";
import { Messages } from "@/app/constants/messages";
import { buildBookingUrl } from "@/app/constants/routes";
import { createBookingSessionDotNet } from "@/lib/api/dotnet-booking-client";
import AppButton from "@/components/ui/atoms/AppButton";

type BookNowButtonProps = {
  roomId?: number;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: string;
  /** When set, dates come from the server booking session (no query-string booking). */
  bookingSessionToken?: string;
  onUnavailable?: (message: string) => void;
  fullWidth?: boolean;
};

type ReadyBookNowButtonProps = {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: string;
  onUnavailable?: (message: string) => void;
  fullWidth?: boolean;
};

function SessionBookNowButton({
  token,
  fullWidth,
}: {
  token: string;
  fullWidth?: boolean;
}) {
  return (
    <AppButton
      type="button"
      fullWidth={fullWidth}
      onClick={() => {
        window.location.href = buildBookingUrl(token);
      }}
      icon={<Hand size={16} />}
    >
      Book Now
    </AppButton>
  );
}

function ReadyBookNowButton({
  roomId,
  checkInDate,
  checkOutDate,
  guestCount,
  onUnavailable,
  fullWidth,
}: ReadyBookNowButtonProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function handleBookNow() {
    setErrorMessage("");
    setIsChecking(true);

    if (!areStayDatesValid(checkInDate, checkOutDate)) {
      const message = Messages.SearchPage.InvalidBookingSelection;
      setErrorMessage(message);
      onUnavailable?.(message);
      setIsChecking(false);
      return;
    }

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
      const message = Messages.RoomSearch.SearchFailed;
      setErrorMessage(message);
      onUnavailable?.(message);
    } finally {
      setIsChecking(false);
    }
  }

  if (errorMessage) {
    return (
      <div className={fullWidth ? "w-full space-y-2" : "max-w-xs space-y-2"}>
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {errorMessage}
        </div>

        <AppButton
          type="button"
          variant="link"
          fullWidth={fullWidth}
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
      fullWidth={fullWidth}
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
  bookingSessionToken,
  onUnavailable,
  fullWidth,
}: BookNowButtonProps) {
  if (bookingSessionToken) {
    return (
      <SessionBookNowButton token={bookingSessionToken} fullWidth={fullWidth} />
    );
  }

  if (!roomId || !checkInDate || !checkOutDate || !guestCount) {
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
      fullWidth={fullWidth}
    />
  );
}
