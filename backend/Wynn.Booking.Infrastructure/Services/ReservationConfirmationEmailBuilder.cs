using System.Globalization;
using System.Net;
using Wynn.Booking.Domain.Enums;
using BookingEntity = Wynn.Booking.Domain.Entities.Booking;

namespace Wynn.Booking.Infrastructure.Services;

internal static class ReservationConfirmationEmailBuilder
{
    internal sealed record EmailContent(string Subject, string TextBody, string HtmlBody);

    internal static EmailContent Build(
        BookingEntity booking,
        string clientBaseUrl)
    {
        var guestName = $"{booking.FirstName} {booking.LastName}";
        var guestCount = booking.AdultCount + booking.ChildCount + booking.InfantCount;
        var isMember = booking.BookingType == BookingType.Member;
        var roomName = booking.Room?.Name ?? "Your room";
        var roomType = booking.Room?.Type ?? "Suite";
        var confirmationUrl = $"{clientBaseUrl.TrimEnd('/')}/confirmation/{booking.ReferenceNumber}";

        var culture = CultureInfo.GetCultureInfo("en-US");
        var total = booking.TotalPrice.ToString("C", culture);
        var nightlyRate = booking.PricePerNight.ToString("C", culture);
        var taxes = booking.TaxAmount.ToString("C", culture);
        var checkIn = booking.CheckInDate.ToString("D", culture);
        var checkOut = booking.CheckOutDate.ToString("D", culture);

        var subject = $"Wynn Las Vegas Reservation Confirmed — {booking.ReferenceNumber}";

        var text = string.Join(
            "\n",
            new[]
            {
                $"Dear {guestName},",
                "",
                isMember
                    ? "Thank you for booking as a Wynn demo member. Your reservation is confirmed."
                    : "Thank you for your reservation. Your stay is confirmed.",
                "",
                $"Confirmation: {booking.ReferenceNumber}",
                $"Room: {roomName} ({roomType})",
                $"Check-in: {checkIn} (3:00 PM)",
                $"Check-out: {checkOut} (11:00 AM)",
                $"Nights: {booking.NumberOfNights}",
                $"Guests: {guestCount}",
                "",
                "Charges",
                $"Rate per night: {nightlyRate}",
                $"Taxes & fees: {taxes}",
                $"Total: {total}",
                string.IsNullOrWhiteSpace(booking.PaymentTransactionId)
                    ? null
                    : $"Payment reference: {booking.PaymentTransactionId}",
                "",
                "Guest contact",
                $"Email: {booking.ContactEmail}",
                $"Address: {booking.City}, {booking.State} {booking.ZipCode}, {booking.Country}",
                string.IsNullOrWhiteSpace(booking.SpecialRequests)
                    ? null
                    : $"Special requests: {booking.SpecialRequests}",
                "",
                $"View confirmation: {confirmationUrl}",
                "",
                "We look forward to welcoming you.",
                "Wynn Las Vegas Reservations (Demo)",
            }.Where(line => line is not null));

        var encodedGuestName = WebUtility.HtmlEncode(guestName);
        var encodedReference = WebUtility.HtmlEncode(booking.ReferenceNumber);
        var encodedRoom = WebUtility.HtmlEncode($"{roomName} ({roomType})");
        var intro = isMember
            ? "Thank you for booking as a demo member. Your reservation details are below."
            : "Thank you for your reservation. Your stay details are below.";

        var html = $"""
            <div style="font-family: Georgia, serif; color: #3a2418; max-width: 640px;">
              <p style="letter-spacing: 0.2em; text-transform: uppercase; color: #8c6b43; font-size: 12px;">
                Wynn Las Vegas
              </p>
              <h1 style="font-size: 24px; margin: 8px 0 16px;">Reservation Confirmed</h1>
              <p>Dear {encodedGuestName},</p>
              <p>{intro}</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px 0;"><strong>Confirmation</strong></td><td>{encodedReference}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Room</strong></td><td>{encodedRoom}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Check-in</strong></td><td>{WebUtility.HtmlEncode(checkIn)} · 3:00 PM</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Check-out</strong></td><td>{WebUtility.HtmlEncode(checkOut)} · 11:00 AM</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Nights</strong></td><td>{booking.NumberOfNights}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Guests</strong></td><td>{guestCount}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Total</strong></td><td>{WebUtility.HtmlEncode(total)}</td></tr>
              </table>
              <p style="margin: 24px 0;">
                <a href="{WebUtility.HtmlEncode(confirmationUrl)}" style="background: #3a2418; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 2px;">
                  View Confirmation
                </a>
              </p>
              <p style="font-size: 12px; color: #666;">This is a simulated confirmation for the Wynn booking demo.</p>
            </div>
            """;

        return new EmailContent(subject, text, html);
    }
}
