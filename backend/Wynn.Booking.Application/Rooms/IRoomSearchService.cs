using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Rooms.Dtos;

namespace Wynn.Booking.Application.Rooms;

public interface IRoomSearchService
{
    Task<ServiceResult<RoomSearchResponseDto>> SearchAsync(
        string checkInDate,
        string checkOutDate,
        int guestCount,
        bool petsAllowed,
        bool nonSmoking,
        decimal? minRating,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<RoomAvailabilityDto>> CheckAvailabilityAsync(
        int roomId,
        string checkInDate,
        string checkOutDate,
        CancellationToken cancellationToken = default);
}
