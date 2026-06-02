using FluentValidation;

namespace Wynn.Booking.Application.Features.BookingSessions.GetBookingSession;

public sealed class GetBookingSessionQueryValidator : AbstractValidator<GetBookingSessionQuery>
{
    public GetBookingSessionQueryValidator()
    {
        RuleFor(x => x.Token).NotEmpty().MaximumLength(100);
    }
}
