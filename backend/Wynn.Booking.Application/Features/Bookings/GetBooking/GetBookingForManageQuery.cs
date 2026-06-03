using MediatR;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Bookings.GetBooking;

public sealed record GetBookingForManageQuery(string ReferenceNumber)
    : IRequest<ServiceResult<object>>;
