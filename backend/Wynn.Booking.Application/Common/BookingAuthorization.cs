using BookingEntity = Wynn.Booking.Domain.Entities.Booking;

namespace Wynn.Booking.Application.Common;

public static class BookingAuthorization
{
    public static string? GetAccessDeniedMessage(BookingEntity booking, ICurrentUserContext currentUser)
    {
        if (!currentUser.IsAuthenticated)
        {
            return "Authentication is required.";
        }

        if (booking.MemberId.HasValue)
        {
            if (currentUser.MemberId != booking.MemberId)
            {
                return "You do not have permission to manage this reservation.";
            }

            return null;
        }

        if (string.IsNullOrWhiteSpace(currentUser.Email) ||
            !string.Equals(
                currentUser.Email,
                booking.ContactEmail,
                StringComparison.OrdinalIgnoreCase))
        {
            return "You do not have permission to manage this reservation.";
        }

        return null;
    }
}
