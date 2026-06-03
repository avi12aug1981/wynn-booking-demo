using FluentValidation;

namespace Wynn.Booking.Application.Features.Rooms.GetRoomDetails;

public sealed class GetRoomDetailsQueryValidator : AbstractValidator<GetRoomDetailsQuery>
{
    public GetRoomDetailsQueryValidator()
    {
        RuleFor(x => x.RoomId).GreaterThan(0);
    }
}
