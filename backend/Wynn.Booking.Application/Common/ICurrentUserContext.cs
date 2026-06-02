namespace Wynn.Booking.Application.Common;

public interface ICurrentUserContext
{
    bool IsAuthenticated { get; }

    int? MemberId { get; }

    string? Email { get; }

    string? Role { get; }
}
