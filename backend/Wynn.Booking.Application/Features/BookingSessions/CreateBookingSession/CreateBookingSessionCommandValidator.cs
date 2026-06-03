using FluentValidation;
using Wynn.Booking.Application.Common.Validation;

namespace Wynn.Booking.Application.Features.BookingSessions.CreateBookingSession;

public sealed class CreateBookingSessionCommandValidator : AbstractValidator<CreateBookingSessionCommand>
{
    public CreateBookingSessionCommandValidator()
    {
        RuleFor(x => x.RoomId).GreaterThan(0);
        RuleFor(x => x.GuestCount).GreaterThanOrEqualTo(1);

        StayDateValidationRules.ApplyRequiredStayDates(
            this,
            c => c.CheckInDate,
            c => c.CheckOutDate);
    }
}
