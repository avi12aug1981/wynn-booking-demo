using Microsoft.EntityFrameworkCore;
using Wynn.Booking.Application.BookingSessions;
using Wynn.Booking.Domain.Entities;
using Wynn.Booking.Domain.Enums;
using Wynn.Booking.Infrastructure.Persistence;

namespace Wynn.Booking.Infrastructure.Repositories;

public sealed class BookingSessionRepository(BookingDbContext dbContext) : IBookingSessionRepository
{
    public Task<BookingSession?> GetByTokenWithRoomAsync(
        string token,
        CancellationToken cancellationToken = default) =>
        dbContext.BookingSessions
            .AsNoTracking()
            .Include(session => session.Room)
            .FirstOrDefaultAsync(session => session.Token == token, cancellationToken);

    public async Task<BookingSession> CreateAsync(
        BookingSession session,
        CancellationToken cancellationToken = default)
    {
        dbContext.BookingSessions.Add(session);
        await dbContext.SaveChangesAsync(cancellationToken);
        return session;
    }

    public async Task ExpireAsync(int sessionId, CancellationToken cancellationToken = default)
    {
        var session = await dbContext.BookingSessions
            .FirstOrDefaultAsync(x => x.Id == sessionId, cancellationToken);

        if (session is null)
        {
            return;
        }

        session.Status = BookingSessionStatus.Expired;
        session.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkConsumedAsync(int sessionId, CancellationToken cancellationToken = default)
    {
        var session = await dbContext.BookingSessions
            .FirstOrDefaultAsync(x => x.Id == sessionId, cancellationToken);

        if (session is null)
        {
            return;
        }

        session.Status = BookingSessionStatus.Consumed;
        session.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
