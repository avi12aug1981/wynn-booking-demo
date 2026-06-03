using MediatR;
using Wynn.Booking.Application.Bookings;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Bookings.GetBooking;

public sealed class GetBookingForManageQueryHandler(IBookingService bookingService)
    : IRequestHandler<GetBookingForManageQuery, ServiceResult<object>>
{
    public Task<ServiceResult<object>> Handle(
        GetBookingForManageQuery request,
        CancellationToken cancellationToken) =>
        bookingService.GetByReferenceForManageAsync(request.ReferenceNumber, cancellationToken);
}
