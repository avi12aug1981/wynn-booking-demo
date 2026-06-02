import { BookingType } from "@/app/types/prisma-enums";
import { sendEmail } from "@/lib/email/mailer";
import { logger } from "@/lib/logger";
import { LogEvents, OperationNames } from "@/constants";

export type ReservationEmailBooking = {
  referenceNumber: string;
  firstName: string;
  lastName: string;
  contactEmail: string;
  bookingType: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfNights: number;
  adultCount: number;
  childCount: number;
  infantCount: number;
  totalPrice: unknown;
  pricePerNight: unknown;
  taxAmount: unknown;
  paymentTransactionId: string | null;
  specialRequests: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  room: {
    name: string;
    type: string;
  };
};

function formatReservationDate(value: Date) {
  return value.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value: unknown) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function getConfirmationPageUrl(referenceNumber: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  return `${baseUrl}/confirmation/${referenceNumber}`;
}

function buildReservationEmailContent(booking: ReservationEmailBooking) {
  const guestName = `${booking.firstName} ${booking.lastName}`;
  const guestCount =
    booking.adultCount + booking.childCount + booking.infantCount;
  const isMember = booking.bookingType === BookingType.MEMBER;
  const confirmationUrl = getConfirmationPageUrl(booking.referenceNumber);
  const total = formatCurrency(booking.totalPrice);
  const nightlyRate = formatCurrency(booking.pricePerNight);
  const taxes = formatCurrency(booking.taxAmount);

  const subject = `Wynn Las Vegas Reservation Confirmed — ${booking.referenceNumber}`;

  const text = [
    `Dear ${guestName},`,
    "",
    isMember
      ? "Thank you for booking as a Wynn demo member. Your reservation is confirmed."
      : "Thank you for your reservation. Your stay is confirmed.",
    "",
    `Confirmation: ${booking.referenceNumber}`,
    `Room: ${booking.room.name} (${booking.room.type})`,
    `Check-in: ${formatReservationDate(booking.checkInDate)} (3:00 PM)`,
    `Check-out: ${formatReservationDate(booking.checkOutDate)} (11:00 AM)`,
    `Nights: ${booking.numberOfNights}`,
    `Guests: ${guestCount}`,
    "",
    "Charges",
    `Rate per night: ${nightlyRate}`,
    `Taxes & fees: ${taxes}`,
    `Total: ${total}`,
    booking.paymentTransactionId
      ? `Payment reference: ${booking.paymentTransactionId}`
      : "",
    "",
    "Guest contact",
    `Email: ${booking.contactEmail}`,
    `Address: ${booking.city}, ${booking.state} ${booking.zipCode}, ${booking.country}`,
    booking.specialRequests
      ? `Special requests: ${booking.specialRequests}`
      : "",
    "",
    `View confirmation: ${confirmationUrl}`,
    "",
    "We look forward to welcoming you.",
    "Wynn Las Vegas Reservations (Demo)",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: Georgia, serif; color: #3a2418; max-width: 640px;">
      <p style="letter-spacing: 0.2em; text-transform: uppercase; color: #8c6b43; font-size: 12px;">
        Wynn Las Vegas
      </p>
      <h1 style="font-size: 24px; margin: 8px 0 16px;">Reservation Confirmed</h1>
      <p>Dear ${guestName},</p>
      <p>
        ${
          isMember
            ? "Thank you for booking as a demo member. Your reservation details are below."
            : "Thank you for your reservation. Your stay details are below."
        }
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px 0;"><strong>Confirmation</strong></td><td>${booking.referenceNumber}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Room</strong></td><td>${booking.room.name} (${booking.room.type})</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Check-in</strong></td><td>${formatReservationDate(booking.checkInDate)} · 3:00 PM</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Check-out</strong></td><td>${formatReservationDate(booking.checkOutDate)} · 11:00 AM</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Nights</strong></td><td>${booking.numberOfNights}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Guests</strong></td><td>${guestCount}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Total</strong></td><td>${total}</td></tr>
      </table>
      <p style="margin: 24px 0;">
        <a href="${confirmationUrl}" style="background: #3a2418; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 2px;">
          View Confirmation
        </a>
      </p>
      <p style="font-size: 12px; color: #666;">This is a simulated confirmation for the Wynn booking demo.</p>
    </div>
  `;

  return { subject, text, html };
}

export async function sendReservationConfirmationEmail(
  booking: ReservationEmailBooking
) {
  const { subject, text, html } = buildReservationEmailContent(booking);

  const result = await sendEmail({
    to: booking.contactEmail,
    subject,
    text,
    html,
  });

  logger.info(OperationNames.SendReservationConfirmation, LogEvents.ReservationEmailSent, {
    referenceNumber: booking.referenceNumber,
    to: booking.contactEmail,
    bookingType: booking.bookingType,
    mode: result.mode,
    messageId: result.messageId,
  });

  return result;
}
