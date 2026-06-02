using MediatR;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Rooms;
using Wynn.Booking.Application.Rooms.Dtos;

namespace Wynn.Booking.Application.Features.Rooms.SearchRooms;

public sealed class SearchRoomsQueryHandler(IRoomSearchService roomSearchService)
    : IRequestHandler<SearchRoomsQuery, ServiceResult<RoomSearchResponseDto>>
{
    public Task<ServiceResult<RoomSearchResponseDto>> Handle(
        SearchRoomsQuery request,
        CancellationToken cancellationToken) =>
        roomSearchService.SearchAsync(
            request.CheckInDate,
            request.CheckOutDate,
            request.GuestCount,
            request.PetsAllowed,
            request.NonSmoking,
            request.MinRating,
            cancellationToken);
}
