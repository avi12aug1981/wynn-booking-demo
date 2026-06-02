using MediatR;
using Wynn.Booking.Application.BookingSessions;
using Wynn.Booking.Application.BookingSessions.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.BookingSessions.CreateBookingSession;

public sealed class CreateBookingSessionCommandHandler(IBookingSessionService bookingSessionService)
    : IRequestHandler<CreateBookingSessionCommand, ServiceResult<CreateBookingSessionResponseDto>>
{
    public Task<ServiceResult<CreateBookingSessionResponseDto>> Handle(
        CreateBookingSessionCommand request,
        CancellationToken cancellationToken) =>
        bookingSessionService.CreateAsync(
            new CreateBookingSessionRequestDto(
                request.RoomId,
                request.CheckInDate,
                request.CheckOutDate,
                request.GuestCount),
            cancellationToken);
}
