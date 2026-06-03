using MediatR;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Rooms.Dtos;

namespace Wynn.Booking.Application.Features.Rooms.GetRoomDetails;

public sealed record GetRoomDetailsQuery(int RoomId, string? CheckInDate, string? CheckOutDate)
    : IRequest<ServiceResult<RoomDetailsDto>>;
