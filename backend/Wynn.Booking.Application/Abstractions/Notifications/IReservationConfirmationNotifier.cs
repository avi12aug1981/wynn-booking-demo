using BookingEntity = Wynn.Booking.Domain.Entities.Booking;

namespace Wynn.Booking.Application.Abstractions.Notifications;

public interface IReservationConfirmationNotifier
{
    Task NotifyAsync(BookingEntity booking, CancellationToken cancellationToken = default);
}
