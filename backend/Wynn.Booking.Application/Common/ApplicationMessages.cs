namespace Wynn.Booking.Application.Common;

/// <summary>
/// User-facing API messages. Keep in sync with app/constants/messages.ts where applicable.
/// </summary>
public static class ApplicationMessages
{
    public static class Common
    {
        public const string RequestFailed = "Request failed.";
        public const string UnexpectedError =
            "An unexpected error occurred. Please try again later.";
        public const string Unauthorized = "Unauthorized.";
        public const string InvalidJsonBody = "The request body contains invalid JSON.";
        public const string InvalidRequestBody = "The request body is invalid.";
        public const string ValidationErrorsOccurred =
            "One or more validation errors occurred.";
    }

    public static class Auth
    {
        public const string InvalidCredentials = "Invalid email or password.";
    }

    public static class Authorization
    {
        public const string AuthenticationRequired = "Authentication is required.";
        public const string AuthenticationRequiredSignInAgain =
            "Authentication is required. Please sign in again.";
        public const string ManageReservationDenied =
            "You do not have permission to manage this reservation.";
        public const string ViewReservationDenied =
            "You do not have permission to view this reservation.";
        public const string PermissionDenied =
            "You do not have permission to perform this action.";
    }

    public static class Validation
    {
        public const string ValidCheckInDate = "Please provide a valid check-in date.";
        public const string ValidCheckOutDate = "Please provide a valid check-out date.";
        public const string CheckInCannotBePast = "Check-in date cannot be in the past.";
        public const string CheckOutCannotBePast = "Check-out date cannot be in the past.";
        public const string CheckOutAfterCheckIn = "Check-out date must be after check-in date.";
        public const string ValidStayDates =
            "Please provide valid check-in and check-out dates.";
        public const string BookingSessionTokenRequired =
            "Booking session token is required. Start checkout via POST /api/booking-sessions.";
        public const string ModifyFieldRequired =
            "At least one field must be provided to modify the reservation.";
    }

    public static class Booking
    {
        public const string NotFound = "Booking not found.";
        public const string AlreadyCancelled = "Booking is already cancelled.";
        public const string Cancelled = "Booking has been cancelled.";
        public const string Updated = "Reservation has been updated.";
        public const string RoomNotAvailable = "Room is not available.";
        public const string SelectedRoomNotAvailable = "Selected room is not available.";
        public const string GuestCountExceedsCapacity = "Guest count exceeds room capacity.";
        public const string PetsNotAllowed = "Pets are not allowed in this room.";
        public const string MaxPetsExceeded = "Maximum of 2 pets allowed.";
        public const string SessionInvalidOrExpired =
            "Booking session is invalid or has expired.";
        public const string SessionMismatch =
            "Booking session does not match the reservation details.";
        public const string OnlyConfirmedCanBeModified =
            "Only confirmed reservations can be modified.";
        public const string CannotModifyAfterCheckInPassed =
            "Cannot modify a reservation after the check-in date has passed.";
        public const string CannotCancelOnOrAfterCheckIn =
            "Cannot cancel a reservation on or after the check-in date.";
        public const string InvalidCheckInDate = "Invalid check-in date.";
        public const string InvalidCheckOutDate = "Invalid check-out date.";
        public const string MemberContactMustMatchAccount =
            "Contact details must match your signed-in member account.";
    }

    public static class BookingSession
    {
        public const string NotFound = "Booking session not found.";
        public const string Inactive = "Booking session is no longer active.";
        public const string Expired = "Booking session has expired.";
    }

    public static class Room
    {
        public const string NotFound = "Room not found.";
        public const string NotAvailable = "Room is not available.";
        public const string AvailableForDates =
            "Room is available for the selected dates.";
        public const string UnavailableForDates =
            "This room is not available for the selected dates.";
        public const string UnavailableForModificationDates =
            "This room is not available for the requested modification dates.";
        public const string InvalidBookingDates = "Please provide valid booking dates.";
    }

    public static class Health
    {
        public const string DatabaseUnavailable = "Database connection unavailable.";
    }
}
