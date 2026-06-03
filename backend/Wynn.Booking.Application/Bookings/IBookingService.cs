using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Bookings;

public interface IBookingService
{
    Task<ServiceResult<CreateBookingResponseDto>> CreateAsync(
        CreateBookingRequestDto request,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<object>> GetByReferenceNumberAsync(
        string referenceNumber,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<object>> GetByReferenceForManageAsync(
        string referenceNumber,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<MemberBookingsResponseDto>> ListByCurrentMemberAsync(
        CancellationToken cancellationToken = default);

    Task<ServiceResult<CancelBookingResponseDto>> CancelAsync(
        string referenceNumber,
        CancelBookingRequestDto? request,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<ModifyBookingResponseDto>> ModifyAsync(
        string referenceNumber,
        ModifyBookingRequestDto request,
        CancellationToken cancellationToken = default);
}
