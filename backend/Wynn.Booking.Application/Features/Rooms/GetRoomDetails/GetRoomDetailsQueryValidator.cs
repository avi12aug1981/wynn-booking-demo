using FluentValidation;
using Wynn.Booking.Application.Common.Validation;

namespace Wynn.Booking.Application.Features.Rooms.GetRoomDetails;

public sealed class GetRoomDetailsQueryValidator : AbstractValidator<GetRoomDetailsQuery>
{
    public GetRoomDetailsQueryValidator()
    {
        RuleFor(x => x.RoomId).GreaterThan(0);

        StayDateValidationRules.ApplyOptionalStayDates(
            this,
            q => q.CheckInDate,
            q => q.CheckOutDate);
    }
}
