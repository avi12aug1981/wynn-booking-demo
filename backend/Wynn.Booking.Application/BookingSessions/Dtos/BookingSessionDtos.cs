namespace Wynn.Booking.Application.BookingSessions.Dtos;

public sealed record CreateBookingSessionRequestDto(
    int RoomId,
    string CheckInDate,
    string CheckOutDate,
    int GuestCount);

public sealed record CreateBookingSessionResponseDto(
    string Token,
    string RedirectUrl,
    int NumberOfNights);

public sealed record BookingSessionDetailDto(
    int Id,
    string Token,
    int RoomId,
    string CheckInDate,
    string CheckOutDate,
    int GuestCount,
    string Status,
    string ExpiresAt,
    RoomSummaryDto Room);

public sealed record RoomSummaryDto(
    int Id,
    string Name,
    string Type,
    decimal PricePerNight,
    int MaxGuests,
    string[] Amenities,
    string? ImageUrl);
