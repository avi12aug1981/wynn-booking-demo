using FluentValidation;
using Wynn.Booking.Application.Common.Validation;

namespace Wynn.Booking.Application.Features.Bookings.ModifyBooking;

public sealed class ModifyBookingCommandValidator : AbstractValidator<ModifyBookingCommand>
{
    public ModifyBookingCommandValidator()
    {
        RuleFor(x => x.ReferenceNumber).NotEmpty().MaximumLength(50);

        RuleFor(x => x.Request)
            .Must(r =>
                r.CheckInDate is not null ||
                r.CheckOutDate is not null ||
                r.AdultCount is not null ||
                r.ChildCount is not null ||
                r.InfantCount is not null ||
                r.PetCount is not null ||
                r.SpecialRequests is not null ||
                r.ContactEmail is not null)
            .WithMessage("At least one field must be provided to modify the reservation.");

        When(x => x.Request.CheckInDate is not null, () =>
        {
            RuleFor(x => x.Request.CheckInDate!).Must(ValidationRules.IsValidDateOnly);
        });

        When(x => x.Request.CheckOutDate is not null, () =>
        {
            RuleFor(x => x.Request.CheckOutDate!).Must(ValidationRules.IsValidDateOnly);
        });

        When(x => x.Request.ContactEmail is not null, () =>
        {
            RuleFor(x => x.Request.ContactEmail!).Must(ValidationRules.IsValidEmail);
        });

        RuleFor(x => x.Request.AdultCount).GreaterThanOrEqualTo(1).When(x => x.Request.AdultCount is not null);
        RuleFor(x => x.Request.ChildCount).GreaterThanOrEqualTo(0).When(x => x.Request.ChildCount is not null);
        RuleFor(x => x.Request.InfantCount).GreaterThanOrEqualTo(0).When(x => x.Request.InfantCount is not null);
        RuleFor(x => x.Request.PetCount).GreaterThanOrEqualTo(0).When(x => x.Request.PetCount is not null);
    }
}
