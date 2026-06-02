using System.Data;
using Microsoft.EntityFrameworkCore;
using Wynn.Booking.Application.BookingSessions;
using Wynn.Booking.Application.Bookings;
using Wynn.Booking.Domain.Enums;
using Wynn.Booking.Domain.Exceptions;
using Wynn.Booking.Infrastructure.Persistence;
using BookingEntity = Wynn.Booking.Domain.Entities.Booking;

namespace Wynn.Booking.Infrastructure.Repositories;

public sealed class BookingRepository(
    BookingDbContext dbContext,
    IBookingSessionRepository bookingSessionRepository) : IBookingRepository
{
    public Task<bool> HasOverlappingConfirmedBookingAsync(
        int roomId,
        DateTime checkInDate,
        DateTime checkOutDate,
        int? excludeBookingId = null,
        CancellationToken cancellationToken = default) =>
        dbContext.Bookings.AnyAsync(
            booking =>
                booking.RoomId == roomId &&
                booking.Status == BookingStatus.Confirmed &&
                (excludeBookingId == null || booking.Id != excludeBookingId) &&
                booking.CheckInDate < checkOutDate &&
                booking.CheckOutDate > checkInDate,
            cancellationToken);

    public Task<BookingEntity?> FindByReferenceNumberAsync(
        string referenceNumber,
        CancellationToken cancellationToken = default) =>
        dbContext.Bookings
            .AsNoTracking()
            .FirstOrDefaultAsync(booking => booking.ReferenceNumber == referenceNumber, cancellationToken);

    public Task<BookingEntity?> FindForUpdateByReferenceNumberAsync(
        string referenceNumber,
        CancellationToken cancellationToken = default) =>
        dbContext.Bookings
            .Include(booking => booking.Room)
            .FirstOrDefaultAsync(booking => booking.ReferenceNumber == referenceNumber, cancellationToken);

    public Task<BookingEntity?> FindDetailsByReferenceNumberAsync(
        string referenceNumber,
        CancellationToken cancellationToken = default) =>
        dbContext.Bookings
            .AsNoTracking()
            .Include(booking => booking.Room)
            .Include(booking => booking.Guests)
            .FirstOrDefaultAsync(booking => booking.ReferenceNumber == referenceNumber, cancellationToken);

    public async Task<BookingEntity> CreateBookingAsync(
        BookingEntity booking,
        int? bookingSessionId,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        if (await HasOverlappingConfirmedBookingAsync(
                booking.RoomId,
                booking.CheckInDate,
                booking.CheckOutDate,
                excludeBookingId: null,
                cancellationToken))
        {
            throw new ConflictException("This room is no longer available for the selected dates.");
        }

        dbContext.Bookings.Add(booking);
        await dbContext.SaveChangesAsync(cancellationToken);

        if (bookingSessionId.HasValue)
        {
            await bookingSessionRepository.MarkConsumedAsync(bookingSessionId.Value, cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
        return booking;
    }

    public async Task<BookingEntity> CancelByReferenceNumberAsync(
        string referenceNumber,
        string? cancellationReason,
        CancellationToken cancellationToken = default)
    {
        var booking = await dbContext.Bookings
            .FirstAsync(x => x.ReferenceNumber == referenceNumber, cancellationToken);

        booking.Status = BookingStatus.Cancelled;
        booking.PaymentStatus = PaymentStatus.Refunded;
        booking.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(cancellationReason))
        {
            var note = $"[Cancelled] {cancellationReason.Trim()}";
            booking.SpecialRequests = string.IsNullOrWhiteSpace(booking.SpecialRequests)
                ? note
                : $"{booking.SpecialRequests}\n{note}";
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return booking;
    }

    public async Task<BookingEntity> ModifyBookingAsync(
        BookingEntity booking,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        if (await HasOverlappingConfirmedBookingAsync(
                booking.RoomId,
                booking.CheckInDate,
                booking.CheckOutDate,
                excludeBookingId: booking.Id,
                cancellationToken))
        {
            throw new ConflictException(
                "This room is not available for the requested modification dates.");
        }

        booking.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return booking;
    }
}
