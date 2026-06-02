using FluentValidation;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Common.Validation;

namespace Wynn.Booking.Application.Features.BookingSessions.CreateBookingSession;

public sealed class CreateBookingSessionCommandValidator : AbstractValidator<CreateBookingSessionCommand>
{
    public CreateBookingSessionCommandValidator()
    {
        RuleFor(x => x.RoomId).GreaterThan(0);
        RuleFor(x => x.GuestCount).GreaterThanOrEqualTo(1);
        RuleFor(x => x.CheckInDate).Must(ValidationRules.IsValidDateOnly);
        RuleFor(x => x.CheckOutDate).Must(ValidationRules.IsValidDateOnly);
        RuleFor(x => x)
            .Must(c =>
            {
                var checkIn = DateHelpers.ParseDateOnly(c.CheckInDate);
                var checkOut = DateHelpers.ParseDateOnly(c.CheckOutDate);
                return checkIn is not null && checkOut is not null && checkOut > checkIn;
            })
            .WithMessage("Invalid booking dates.");
    }
}
