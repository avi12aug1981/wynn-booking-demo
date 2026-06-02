using Wynn.Booking.Domain.Entities;

namespace Wynn.Booking.Application.Rooms;

public sealed record RoomAvailabilityCriteria(
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int GuestCount,
    bool? PetsAllowed,
    bool? NonSmoking,
    decimal? MinRating);

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(int roomId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Room>> FindAvailableRoomsAsync(
        RoomAvailabilityCriteria criteria,
        CancellationToken cancellationToken = default);
}
