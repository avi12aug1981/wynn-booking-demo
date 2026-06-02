using MediatR;
using Wynn.Booking.Application.Bookings;
using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Bookings.CancelBooking;

public sealed class CancelBookingCommandHandler(IBookingService bookingService)
    : IRequestHandler<CancelBookingCommand, ServiceResult<CancelBookingResponseDto>>
{
    public Task<ServiceResult<CancelBookingResponseDto>> Handle(
        CancelBookingCommand request,
        CancellationToken cancellationToken) =>
        bookingService.CancelAsync(request.ReferenceNumber, request.Request, cancellationToken);
}
