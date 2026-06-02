using FluentValidation;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Common.Validation;

namespace Wynn.Booking.Application.Features.Rooms.SearchRooms;

public sealed class SearchRoomsQueryValidator : AbstractValidator<SearchRoomsQuery>
{
    public SearchRoomsQueryValidator()
    {
        RuleFor(x => x.CheckInDate)
            .Must(ValidationRules.IsValidDateOnly)
            .WithMessage("Please provide a valid check-in date.");

        RuleFor(x => x.CheckOutDate)
            .Must(ValidationRules.IsValidDateOnly)
            .WithMessage("Please provide a valid check-out date.");

        RuleFor(x => x)
            .Must(q =>
            {
                var checkIn = DateHelpers.ParseDateOnly(q.CheckInDate);
                var checkOut = DateHelpers.ParseDateOnly(q.CheckOutDate);
                return checkIn is not null && checkOut is not null && checkOut > checkIn;
            })
            .WithMessage("Check-out date must be after check-in date.");

        RuleFor(x => x.GuestCount).GreaterThanOrEqualTo(1);

        RuleFor(x => x.MinRating)
            .InclusiveBetween(0, 5)
            .When(x => x.MinRating.HasValue);
    }
}
