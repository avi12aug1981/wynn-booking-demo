using FluentValidation;

namespace Wynn.Booking.Application.Features.Bookings.GetBooking;

public sealed class GetBookingForManageQueryValidator
    : AbstractValidator<GetBookingForManageQuery>
{
    public GetBookingForManageQueryValidator()
    {
        RuleFor(x => x.ReferenceNumber).NotEmpty().MaximumLength(50);
    }
}
