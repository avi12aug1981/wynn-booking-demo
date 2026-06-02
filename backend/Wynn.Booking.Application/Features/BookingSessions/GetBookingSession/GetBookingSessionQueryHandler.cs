using MediatR;
using Wynn.Booking.Application.BookingSessions;
using Wynn.Booking.Application.BookingSessions.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.BookingSessions.GetBookingSession;

public sealed class GetBookingSessionQueryHandler(IBookingSessionService bookingSessionService)
    : IRequestHandler<GetBookingSessionQuery, ServiceResult<BookingSessionDetailDto>>
{
    public Task<ServiceResult<BookingSessionDetailDto>> Handle(
        GetBookingSessionQuery request,
        CancellationToken cancellationToken) =>
        bookingSessionService.GetByTokenAsync(request.Token, cancellationToken);
}
