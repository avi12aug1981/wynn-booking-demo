using FluentValidation;
using Wynn.Booking.Application.Common.Validation;

namespace Wynn.Booking.Application.Features.Rooms.SearchRooms;

public sealed class SearchRoomsQueryValidator : AbstractValidator<SearchRoomsQuery>
{
    public SearchRoomsQueryValidator()
    {
        StayDateValidationRules.ApplyRequiredStayDates(
            this,
            q => q.CheckInDate,
            q => q.CheckOutDate);

        RuleFor(x => x.GuestCount).GreaterThanOrEqualTo(1);

        RuleFor(x => x.MinRating)
            .InclusiveBetween(0, 5)
            .When(x => x.MinRating.HasValue);
    }
}
