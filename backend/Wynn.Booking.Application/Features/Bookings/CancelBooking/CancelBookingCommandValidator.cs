using FluentValidation;

namespace Wynn.Booking.Application.Features.Bookings.CancelBooking;

public sealed class CancelBookingCommandValidator : AbstractValidator<CancelBookingCommand>
{
    public CancelBookingCommandValidator()
    {
        RuleFor(x => x.ReferenceNumber).NotEmpty().MaximumLength(50);

        When(x => x.Request?.CancellationReason is not null, () =>
        {
            RuleFor(x => x.Request!.CancellationReason).MaximumLength(500);
        });
    }
}
