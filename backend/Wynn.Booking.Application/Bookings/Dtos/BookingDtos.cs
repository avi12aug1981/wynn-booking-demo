using Wynn.Booking.Domain.Enums;

namespace Wynn.Booking.Application.Bookings.Dtos;

public sealed record BookingGuestRequestDto(
    int Sequence,
    string FirstName,
    string LastName,
    Gender? Gender,
    AgeGroup AgeGroup);

public sealed record CreateBookingRequestDto(
    string? BookingSessionToken,
    int RoomId,
    int? MemberId,
    BookingType BookingType,
    string FirstName,
    string LastName,
    Gender Gender,
    string ContactEmail,
    int AdultCount,
    int? ChildCount,
    int? InfantCount,
    int? PetCount,
    IReadOnlyList<BookingGuestRequestDto>? Guests,
    string CheckInDate,
    string CheckOutDate,
    string? SpecialRequests,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string ZipCode,
    string? Country);

public sealed record CreateBookingResponseDto(
    string ReferenceNumber,
    string RoomName,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NumberOfNights,
    decimal TotalPrice,
    PaymentStatus PaymentStatus,
    BookingStatus BookingStatus,
    bool ConfirmationEmailSent);

public sealed record CancelBookingRequestDto(string? CancellationReason);

public sealed record CancelBookingResponseDto(
    string ReferenceNumber,
    BookingStatus BookingStatus,
    PaymentStatus PaymentStatus,
    string Message,
    DateTime CancelledAt);

public sealed record ModifyBookingRequestDto(
    string? CheckInDate,
    string? CheckOutDate,
    int? AdultCount,
    int? ChildCount,
    int? InfantCount,
    int? PetCount,
    string? SpecialRequests,
    string? ContactEmail);

public sealed record ModifyBookingResponseDto(
    string ReferenceNumber,
    string RoomName,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    int NumberOfNights,
    int AdultCount,
    int ChildCount,
    int InfantCount,
    int PetCount,
    decimal TotalPrice,
    BookingStatus BookingStatus,
    PaymentStatus PaymentStatus,
    string Message);
