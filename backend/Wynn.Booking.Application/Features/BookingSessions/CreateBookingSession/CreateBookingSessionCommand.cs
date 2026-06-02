using MediatR;
using Wynn.Booking.Application.BookingSessions.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.BookingSessions.CreateBookingSession;

public sealed record CreateBookingSessionCommand(
    int RoomId,
    string CheckInDate,
    string CheckOutDate,
    int GuestCount) : IRequest<ServiceResult<CreateBookingSessionResponseDto>>;
