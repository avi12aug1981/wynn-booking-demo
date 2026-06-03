using MediatR;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Rooms;
using Wynn.Booking.Application.Rooms.Dtos;

namespace Wynn.Booking.Application.Features.Rooms.GetRoomDetails;

public sealed class GetRoomDetailsQueryHandler(IRoomRepository roomRepository)
    : IRequestHandler<GetRoomDetailsQuery, ServiceResult<RoomDetailsDto>>
{
    public async Task<ServiceResult<RoomDetailsDto>> Handle(
        GetRoomDetailsQuery request,
        CancellationToken cancellationToken)
    {
        var room = await roomRepository.GetByIdAsync(request.RoomId, cancellationToken);

        if (room is null || !room.IsActive)
        {
            return ServiceResult<RoomDetailsDto>.Fail(ApplicationMessages.Room.NotFound, 404);
        }

        int? numberOfNights = null;
        decimal? estimatedSubtotal = null;

        if (
            !string.IsNullOrWhiteSpace(request.CheckInDate)
            && !string.IsNullOrWhiteSpace(request.CheckOutDate))
        {
            var checkIn = DateHelpers.ParseDateOnly(request.CheckInDate)!.Value;
            var checkOut = DateHelpers.ParseDateOnly(request.CheckOutDate)!.Value;
            numberOfNights = DateHelpers.CalculateNumberOfNights(checkIn, checkOut);
            estimatedSubtotal = decimal.Round(room.PricePerNight * numberOfNights.Value, 2);
        }

        var details = new RoomDetailsDto(
            room.Id,
            room.Name,
            room.Type,
            room.Description,
            room.PricePerNight,
            room.MaxGuests,
            room.Amenities.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
            room.ImageUrl,
            room.PetsAllowed,
            room.SmokingAllowed,
            room.Rating,
            room.ReviewCount,
            room.Status.ToString(),
            numberOfNights,
            estimatedSubtotal);

        return ServiceResult<RoomDetailsDto>.Ok(details);
    }
}
