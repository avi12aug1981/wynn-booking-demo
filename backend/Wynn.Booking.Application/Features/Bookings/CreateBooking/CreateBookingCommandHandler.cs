using MediatR;
using Wynn.Booking.Application.Bookings;
using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Bookings.CreateBooking;

public sealed class CreateBookingCommandHandler(IBookingService bookingService)
    : IRequestHandler<CreateBookingCommand, ServiceResult<CreateBookingResponseDto>>
{
    public Task<ServiceResult<CreateBookingResponseDto>> Handle(
        CreateBookingCommand request,
        CancellationToken cancellationToken) =>
        bookingService.CreateAsync(
            new CreateBookingRequestDto(
                request.BookingSessionToken,
                request.RoomId,
                request.MemberId,
                request.BookingType,
                request.FirstName,
                request.LastName,
                request.Gender,
                request.ContactEmail,
                request.AdultCount,
                request.ChildCount,
                request.InfantCount,
                request.PetCount,
                request.Guests,
                request.CheckInDate,
                request.CheckOutDate,
                request.SpecialRequests,
                request.AddressLine1,
                request.AddressLine2,
                request.City,
                request.State,
                request.ZipCode,
                request.Country),
            cancellationToken);
}
