namespace Wynn.Booking.Application.Rooms.Dtos;

public sealed record RoomSearchResultDto(
    int Id,
    string Name,
    string Type,
    string Description,
    decimal PricePerNight,
    int MaxGuests,
    IReadOnlyList<string> Amenities,
    string? ImageUrl,
    bool PetsAllowed,
    bool SmokingAllowed,
    decimal Rating,
    int ReviewCount,
    int NumberOfNights,
    decimal EstimatedSubtotal);

public sealed record RoomSearchResponseDto(IReadOnlyList<RoomSearchResultDto> Rooms);

public sealed record RoomAvailabilityDto(
    bool Available,
    string Reason,
    string Message);

public sealed record RoomDetailsDto(
    int Id,
    string Name,
    string Type,
    string Description,
    decimal PricePerNight,
    int MaxGuests,
    IReadOnlyList<string> Amenities,
    string? ImageUrl,
    bool PetsAllowed,
    bool SmokingAllowed,
    decimal Rating,
    int ReviewCount,
    string Status,
    int? NumberOfNights,
    decimal? EstimatedSubtotal);
