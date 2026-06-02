using BookingEntity = Wynn.Booking.Domain.Entities.Booking;

namespace Wynn.Booking.Application.Bookings;

public interface IBookingRepository
{
    Task<bool> HasOverlappingConfirmedBookingAsync(
        int roomId,
        DateTime checkInDate,
        DateTime checkOutDate,
        int? excludeBookingId = null,
        CancellationToken cancellationToken = default);

    Task<BookingEntity?> FindByReferenceNumberAsync(
        string referenceNumber,
        CancellationToken cancellationToken = default);

    Task<BookingEntity?> FindForUpdateByReferenceNumberAsync(
        string referenceNumber,
        CancellationToken cancellationToken = default);

    Task<BookingEntity?> FindDetailsByReferenceNumberAsync(
        string referenceNumber,
        CancellationToken cancellationToken = default);

    Task<BookingEntity> CreateBookingAsync(
        BookingEntity booking,
        int? bookingSessionId,
        CancellationToken cancellationToken = default);

    Task<BookingEntity> CancelByReferenceNumberAsync(
        string referenceNumber,
        string? cancellationReason,
        CancellationToken cancellationToken = default);

    Task<BookingEntity> ModifyBookingAsync(
        BookingEntity booking,
        CancellationToken cancellationToken = default);
}
