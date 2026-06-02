using FluentValidation;

namespace Wynn.Booking.Application.Features.Bookings.GetBooking;

public sealed class GetBookingByReferenceQueryValidator : AbstractValidator<GetBookingByReferenceQuery>
{
    public GetBookingByReferenceQueryValidator()
    {
        RuleFor(x => x.ReferenceNumber).NotEmpty().MaximumLength(50);
    }
}
