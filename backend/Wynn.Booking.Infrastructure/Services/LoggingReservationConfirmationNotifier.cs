using Microsoft.Extensions.Logging;
using Wynn.Booking.Application.Abstractions.Notifications;
using BookingEntity = Wynn.Booking.Domain.Entities.Booking;

namespace Wynn.Booking.Infrastructure.Services;

/// <summary>
/// Production would send email (SendGrid, ACS). This implementation logs and keeps booking durable.
/// </summary>
public sealed class LoggingReservationConfirmationNotifier(
    ILogger<LoggingReservationConfirmationNotifier> logger) : IReservationConfirmationNotifier
{
    public Task NotifyAsync(BookingEntity booking, CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "Reservation confirmation queued for {ReferenceNumber} to {Email}",
            booking.ReferenceNumber,
            booking.ContactEmail);

        return Task.CompletedTask;
    }
}
