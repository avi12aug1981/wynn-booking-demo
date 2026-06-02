using MediatR;
using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Bookings.CancelBooking;

public sealed record CancelBookingCommand(
    string ReferenceNumber,
    CancelBookingRequestDto? Request) : IRequest<ServiceResult<CancelBookingResponseDto>>;
