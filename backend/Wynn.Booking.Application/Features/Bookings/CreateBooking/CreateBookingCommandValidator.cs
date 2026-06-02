using FluentValidation;
using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Common.Validation;

namespace Wynn.Booking.Application.Features.Bookings.CreateBooking;

public sealed class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.BookingSessionToken)
            .NotEmpty()
            .WithMessage("Booking session token is required. Start checkout via POST /api/booking-sessions.");

        RuleFor(x => x.RoomId).GreaterThan(0);
        RuleFor(x => x.FirstName).NotEmpty().Must(ValidationRules.IsSafeText);
        RuleFor(x => x.LastName).NotEmpty().Must(ValidationRules.IsSafeText);
        RuleFor(x => x.ContactEmail).NotEmpty().Must(ValidationRules.IsValidEmail);
        RuleFor(x => x.AddressLine1).NotEmpty();
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.State).NotEmpty();
        RuleFor(x => x.ZipCode).NotEmpty();
        RuleFor(x => x.CheckInDate).Must(ValidationRules.IsValidDateOnly);
        RuleFor(x => x.CheckOutDate).Must(ValidationRules.IsValidDateOnly);
        RuleFor(x => x)
            .Must(c =>
            {
                var checkIn = DateHelpers.ParseDateOnly(c.CheckInDate);
                var checkOut = DateHelpers.ParseDateOnly(c.CheckOutDate);
                return checkIn is not null && checkOut is not null && checkOut > checkIn;
            })
            .WithMessage("Check-out must be after check-in.");
        RuleFor(x => x.AdultCount).GreaterThanOrEqualTo(1);
        RuleFor(x => x.ChildCount).GreaterThanOrEqualTo(0).When(x => x.ChildCount.HasValue);
        RuleFor(x => x.InfantCount).GreaterThanOrEqualTo(0).When(x => x.InfantCount.HasValue);
        RuleFor(x => x.PetCount).GreaterThanOrEqualTo(0).When(x => x.PetCount.HasValue);
        RuleForEach(x => x.Guests).ChildRules(guest =>
        {
            guest.RuleFor(g => g.FirstName).Must(ValidationRules.IsSafeText);
            guest.RuleFor(g => g.LastName).Must(ValidationRules.IsSafeText);
        }).When(x => x.Guests is not null);
    }
}
