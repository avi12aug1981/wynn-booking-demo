import { ApplicationConstants } from "@/app/constants/application-constants";

export function createBookingSessionExpiresAt(from = new Date()): Date {
  const expiresAt = new Date(from);
  expiresAt.setMinutes(
    expiresAt.getMinutes() + ApplicationConstants.BookingSessionTimeoutMinutes
  );

  return expiresAt;
}
