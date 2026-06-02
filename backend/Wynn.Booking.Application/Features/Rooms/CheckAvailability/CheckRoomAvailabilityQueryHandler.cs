using MediatR;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Rooms;
using Wynn.Booking.Application.Rooms.Dtos;

namespace Wynn.Booking.Application.Features.Rooms.CheckAvailability;

public sealed class CheckRoomAvailabilityQueryHandler(IRoomSearchService roomSearchService)
    : IRequestHandler<CheckRoomAvailabilityQuery, ServiceResult<RoomAvailabilityDto>>
{
    public Task<ServiceResult<RoomAvailabilityDto>> Handle(
        CheckRoomAvailabilityQuery request,
        CancellationToken cancellationToken) =>
        roomSearchService.CheckAvailabilityAsync(
            request.RoomId,
            request.CheckInDate,
            request.CheckOutDate,
            cancellationToken);
}
