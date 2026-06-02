using MediatR;
using Wynn.Booking.Application.BookingSessions.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.BookingSessions.GetBookingSession;

public sealed record GetBookingSessionQuery(string Token) : IRequest<ServiceResult<BookingSessionDetailDto>>;
