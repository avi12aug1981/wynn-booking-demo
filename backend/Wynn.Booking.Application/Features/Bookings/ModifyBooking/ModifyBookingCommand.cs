using MediatR;
using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Bookings.ModifyBooking;

public sealed record ModifyBookingCommand(
    string ReferenceNumber,
    ModifyBookingRequestDto Request) : IRequest<ServiceResult<ModifyBookingResponseDto>>;
