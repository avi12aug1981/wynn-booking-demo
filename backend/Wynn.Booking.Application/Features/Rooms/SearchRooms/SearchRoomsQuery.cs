using MediatR;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Rooms.Dtos;

namespace Wynn.Booking.Application.Features.Rooms.SearchRooms;

public sealed record SearchRoomsQuery(
    string CheckInDate,
    string CheckOutDate,
    int GuestCount,
    bool PetsAllowed,
    bool NonSmoking,
    decimal? MinRating) : IRequest<ServiceResult<RoomSearchResponseDto>>;
