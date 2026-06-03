using BookingEntity = Wynn.Booking.Domain.Entities.Booking;
using Wynn.Booking.Domain.Enums;

namespace Wynn.Booking.Application.Common;

public static class BookingAuthorization
{
    private static bool EmailsMatch(BookingEntity booking, ICurrentUserContext currentUser) =>
        !string.IsNullOrWhiteSpace(currentUser.Email) &&
        string.Equals(
            currentUser.Email,
            booking.ContactEmail,
            StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Member account owns this booking (member id + member booking type).
    /// </summary>
    public static bool OwnedByMemberAccount(
        BookingEntity booking,
        ICurrentUserContext currentUser) =>
        currentUser.IsAuthenticated &&
        currentUser.MemberId.HasValue &&
        booking.BookingType == BookingType.Member &&
        booking.MemberId == currentUser.MemberId;

    /// <summary>
    /// Shown in member history — excludes legacy rows linked to the account but another email.
    /// </summary>
    public static bool ShouldAppearInMemberHistory(
        BookingEntity booking,
        ICurrentUserContext currentUser) =>
        OwnedByMemberAccount(booking, currentUser) && EmailsMatch(booking, currentUser);

    /// <summary>
    /// Confirmation / lookup by reference (guest checkout and email links).
    /// </summary>
    public static string? GetViewDeniedMessage(
        BookingEntity booking,
        ICurrentUserContext currentUser)
    {
        if (booking.BookingType == BookingType.Guest)
        {
            if (!currentUser.IsAuthenticated)
            {
                return null;
            }

            if (!EmailsMatch(booking, currentUser))
            {
                return ApplicationMessages.Authorization.ViewReservationDenied;
            }

            return null;
        }

        // Member confirmation: reference in email works without sign-in (same as guest links).
        if (!currentUser.IsAuthenticated)
        {
            return null;
        }

        if (!OwnedByMemberAccount(booking, currentUser))
        {
            return ApplicationMessages.Authorization.ViewReservationDenied;
        }

        if (!EmailsMatch(booking, currentUser))
        {
            return ApplicationMessages.Authorization.ViewReservationDenied;
        }

        return null;
    }

    /// <summary>
    /// Signed-in member reservation management (/reservations/*).
    /// </summary>
    public static string? GetManageViewDeniedMessage(
        BookingEntity booking,
        ICurrentUserContext currentUser)
    {
        if (!currentUser.IsAuthenticated || !currentUser.MemberId.HasValue)
        {
            return ApplicationMessages.Authorization.AuthenticationRequired;
        }

        if (!OwnedByMemberAccount(booking, currentUser))
        {
            return ApplicationMessages.Authorization.ViewReservationDenied;
        }

        return null;
    }

    public static string? GetAccessDeniedMessage(BookingEntity booking, ICurrentUserContext currentUser)
    {
        if (!currentUser.IsAuthenticated)
        {
            return ApplicationMessages.Authorization.AuthenticationRequired;
        }

        if (booking.BookingType == BookingType.Member)
        {
            if (!ShouldAppearInMemberHistory(booking, currentUser))
            {
                return ApplicationMessages.Authorization.ManageReservationDenied;
            }

            return null;
        }

        if (!EmailsMatch(booking, currentUser))
        {
            return ApplicationMessages.Authorization.ManageReservationDenied;
        }

        return null;
    }
}
