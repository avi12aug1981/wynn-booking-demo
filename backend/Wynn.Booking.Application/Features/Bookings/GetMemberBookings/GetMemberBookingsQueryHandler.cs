using MediatR;
using Wynn.Booking.Application.Bookings;
using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Bookings.GetMemberBookings;

public sealed class GetMemberBookingsQueryHandler(IBookingService bookingService)
    : IRequestHandler<GetMemberBookingsQuery, ServiceResult<MemberBookingsResponseDto>>
{
    public Task<ServiceResult<MemberBookingsResponseDto>> Handle(
        GetMemberBookingsQuery request,
        CancellationToken cancellationToken) =>
        bookingService.ListByCurrentMemberAsync(cancellationToken);
}
