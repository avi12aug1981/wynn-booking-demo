using FluentValidation;
using Wynn.Booking.Application.Common.Validation;

namespace Wynn.Booking.Application.Features.Rooms.CheckAvailability;

public sealed class CheckRoomAvailabilityQueryValidator : AbstractValidator<CheckRoomAvailabilityQuery>
{
    public CheckRoomAvailabilityQueryValidator()
    {
        RuleFor(x => x.RoomId).GreaterThan(0);
        RuleFor(x => x.CheckInDate).Must(ValidationRules.IsValidDateOnly);
        RuleFor(x => x.CheckOutDate).Must(ValidationRules.IsValidDateOnly);
    }
}
