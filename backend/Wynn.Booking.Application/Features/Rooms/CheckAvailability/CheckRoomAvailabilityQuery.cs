using MediatR;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Rooms.Dtos;

namespace Wynn.Booking.Application.Features.Rooms.CheckAvailability;

public sealed record CheckRoomAvailabilityQuery(
    int RoomId,
    string CheckInDate,
    string CheckOutDate) : IRequest<ServiceResult<RoomAvailabilityDto>>;
