namespace Wynn.Booking.Application.Common;

public interface ICurrentUserContext
{
    bool IsAuthenticated { get; }

    int? MemberId { get; }

    string? Email { get; }

    string? FirstName { get; }

    string? LastName { get; }

    string? Role { get; }
}
