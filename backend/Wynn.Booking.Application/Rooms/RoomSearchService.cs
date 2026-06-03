using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Rooms.Dtos;

namespace Wynn.Booking.Application.Rooms;

public sealed class RoomSearchService(IRoomRepository roomRepository) : IRoomSearchService
{
    public async Task<ServiceResult<RoomSearchResponseDto>> SearchAsync(
        string checkInDate,
        string checkOutDate,
        int guestCount,
        bool petsAllowed,
        bool nonSmoking,
        decimal? minRating,
        CancellationToken cancellationToken = default)
    {
        var dateValidation = DateHelpers.ValidateStayDateRange(checkInDate, checkOutDate);
        if (!dateValidation.IsValid)
        {
            return ServiceResult<RoomSearchResponseDto>.Fail(dateValidation.ErrorMessage!, 400);
        }

        var checkIn = DateHelpers.ParseDateOnly(checkInDate)!.Value;
        var checkOut = DateHelpers.ParseDateOnly(checkOutDate)!.Value;
        var nights = DateHelpers.CalculateNumberOfNights(checkIn, checkOut);

        var rooms = await roomRepository.FindAvailableRoomsAsync(
            new RoomAvailabilityCriteria(
                checkIn,
                checkOut,
                guestCount,
                petsAllowed ? true : null,
                nonSmoking ? true : null,
                minRating),
            cancellationToken);

        var results = rooms.Select(room =>
        {
            var subtotal = room.PricePerNight * nights;
            return new RoomSearchResultDto(
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
                nights,
                decimal.Round(subtotal, 2));
        }).ToList();

        return ServiceResult<RoomSearchResponseDto>.Ok(new RoomSearchResponseDto(results));
    }

    public async Task<ServiceResult<RoomAvailabilityDto>> CheckAvailabilityAsync(
        int roomId,
        string checkInDate,
        string checkOutDate,
        CancellationToken cancellationToken = default)
    {
        var checkIn = DateHelpers.ParseDateOnly(checkInDate);
        var checkOut = DateHelpers.ParseDateOnly(checkOutDate);

        if (checkIn is null || checkOut is null || checkOut <= checkIn)
        {
            return ServiceResult<RoomAvailabilityDto>.Ok(
                new RoomAvailabilityDto(
                    false,
                    "unavailable",
                    ApplicationMessages.Room.InvalidBookingDates));
        }

        var room = await roomRepository.GetByIdAsync(roomId, cancellationToken);

        if (room is null || !room.IsActive)
        {
            return ServiceResult<RoomAvailabilityDto>.Ok(
                new RoomAvailabilityDto(
                    false,
                    "unavailable",
                    ApplicationMessages.Room.NotAvailable));
        }

        var availableRooms = await roomRepository.FindAvailableRoomsAsync(
            new RoomAvailabilityCriteria(checkIn.Value, checkOut.Value, 1, null, null, null),
            cancellationToken);

        if (availableRooms.Any(r => r.Id == roomId))
        {
            return ServiceResult<RoomAvailabilityDto>.Ok(
                new RoomAvailabilityDto(
                    true,
                    "available",
                    ApplicationMessages.Room.AvailableForDates));
        }

        return ServiceResult<RoomAvailabilityDto>.Ok(
            new RoomAvailabilityDto(
                false,
                "booked",
                ApplicationMessages.Room.UnavailableForDates));
    }
}
