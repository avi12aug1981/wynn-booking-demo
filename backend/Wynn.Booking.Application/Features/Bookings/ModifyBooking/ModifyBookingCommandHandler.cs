using MediatR;
using Wynn.Booking.Application.Bookings;
using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Bookings.ModifyBooking;

public sealed class ModifyBookingCommandHandler(IBookingService bookingService)
    : IRequestHandler<ModifyBookingCommand, ServiceResult<ModifyBookingResponseDto>>
{
    public Task<ServiceResult<ModifyBookingResponseDto>> Handle(
        ModifyBookingCommand request,
        CancellationToken cancellationToken) =>
        bookingService.ModifyAsync(request.ReferenceNumber, request.Request, cancellationToken);
}
