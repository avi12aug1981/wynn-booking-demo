using Wynn.Booking.Domain.Entities;

namespace Wynn.Booking.Application.BookingSessions;

public interface IBookingSessionRepository
{
    Task<BookingSession?> GetByTokenWithRoomAsync(string token, CancellationToken cancellationToken = default);

    Task<BookingSession> CreateAsync(BookingSession session, CancellationToken cancellationToken = default);

    Task ExpireAsync(int sessionId, CancellationToken cancellationToken = default);

    Task MarkConsumedAsync(int sessionId, CancellationToken cancellationToken = default);
}
