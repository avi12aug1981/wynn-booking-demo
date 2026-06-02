using Microsoft.EntityFrameworkCore;
using Wynn.Booking.Application.Rooms;
using Wynn.Booking.Domain.Entities;
using Wynn.Booking.Domain.Enums;
using Wynn.Booking.Infrastructure.Persistence;

namespace Wynn.Booking.Infrastructure.Repositories;

public sealed class RoomRepository(BookingDbContext dbContext) : IRoomRepository
{
    public Task<Room?> GetByIdAsync(int roomId, CancellationToken cancellationToken = default) =>
        dbContext.Rooms.AsNoTracking().FirstOrDefaultAsync(x => x.Id == roomId, cancellationToken);

    public async Task<IReadOnlyList<Room>> FindAvailableRoomsAsync(
        RoomAvailabilityCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Rooms.AsNoTracking().Where(room =>
            room.IsActive &&
            room.Status == RoomStatus.Available &&
            room.MaxGuests >= criteria.GuestCount);

        if (criteria.PetsAllowed == true)
        {
            query = query.Where(room => room.PetsAllowed);
        }

        if (criteria.NonSmoking == true)
        {
            query = query.Where(room => !room.SmokingAllowed);
        }

        if (criteria.MinRating.HasValue)
        {
            query = query.Where(room => room.Rating >= criteria.MinRating.Value);
        }

        query = query.Where(room => !room.Bookings.Any(booking =>
            booking.Status == BookingStatus.Confirmed &&
            booking.CheckInDate < criteria.CheckOutDate &&
            booking.CheckOutDate > criteria.CheckInDate));

        return await query
            .OrderBy(room => room.PricePerNight)
            .ToListAsync(cancellationToken);
    }
}
