using MediatR;
using Wynn.Booking.Application.Bookings;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Bookings.GetBooking;

public sealed class GetBookingByReferenceQueryHandler(IBookingService bookingService)
    : IRequestHandler<GetBookingByReferenceQuery, ServiceResult<object>>
{
    public Task<ServiceResult<object>> Handle(
        GetBookingByReferenceQuery request,
        CancellationToken cancellationToken) =>
        bookingService.GetByReferenceNumberAsync(request.ReferenceNumber, cancellationToken);
}
