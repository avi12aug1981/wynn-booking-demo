using Wynn.Booking.Application.BookingSessions.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.BookingSessions;

public interface IBookingSessionService
{
    Task<ServiceResult<CreateBookingSessionResponseDto>> CreateAsync(
        CreateBookingSessionRequestDto request,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<BookingSessionDetailDto>> GetByTokenAsync(
        string token,
        CancellationToken cancellationToken = default);
}
