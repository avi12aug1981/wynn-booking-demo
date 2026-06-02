using MediatR;
using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Domain.Enums;

namespace Wynn.Booking.Application.Features.Bookings.CreateBooking;

public sealed record CreateBookingCommand(
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
    string? Country) : IRequest<ServiceResult<CreateBookingResponseDto>>;
