export const Messages = {
  Common: {
    UnexpectedError: "An unexpected error occurred. Please try again later.",
    InvalidRequest: "Invalid request.",

    CreateBookingFailed: "Create booking API failed.",
    BookingLookupFailed: "Booking lookup API failed.",
    CancelBookingFailed: "Cancel booking API failed.",
    RoomSearchFailed: "Room search API failed.",
    CreateBookingSessionFailed: "Create booking session API failed.",
    GetBookingSessionFailed: "Get booking session API failed.",
  },

  Booking: {
    RoomRequired: "Room is required.",
    FirstNameRequired: "First name is required.",
    LastNameRequired: "Last name is required.",
    ContactEmailRequired: "Contact email is required.",
    InvalidEmail: "Please provide a valid email address.",

    AddressRequired: "Address line 1 is required.",
    CityRequired: "City is required.",
    StateRequired: "State is required.",
    ZipCodeRequired: "ZIP code is required.",
    InvalidZipCode: "ZIP code must be 5 to 10 digits.",
    PhoneRequired: "Phone number is required.",
    InvalidPhoneNumber: "Phone number must be 10 to 15 digits.",
    InvalidBillingZip: "Billing ZIP must be 5 to 10 digits.",

    DatesRequired: "Check-in and check-out dates are required.",
    InvalidDates: "Please provide valid booking dates.",
    CheckoutMustBeAfterCheckin: "Check-out date must be after check-in date.",
    CheckInDateCannotBePast: "Check-in date cannot be in the past.",

    AdultRequired: "At least one adult guest is required.",
    InvalidGuestCount: "Guest counts cannot be negative.",
    RoomCapacityExceeded:
      "The selected room cannot accommodate the requested number of guests.",
    MemberProfileLocked:
      "Contact details are taken from your member account and cannot be changed during booking.",

    InvalidGuestName: "Name contains invalid characters.",

    RoomNotAvailable: "Selected room is not available.",
    RoomNoLongerAvailable:
      "This room is no longer available for the selected dates.",
    RoomBookingInProgress:
      "This room is currently being booked by another guest. Please choose another room or try again shortly.",

    PetsNotAllowed: "Pets are not allowed in the selected room.",
    InvalidPetCount: "Pet count must be zero or greater.",
    MaxPetsExceeded: "A maximum of 2 pets are allowed per reservation.",

    BookingCreated: "Booking created successfully.",
    BookingNotFound: "Booking not found.",
    BookingAlreadyCancelled: "Booking is already cancelled.",
    BookingCancelled: "Booking cancelled successfully.",

    InvalidBookingSession:
      "Your booking session is invalid or has expired. Please search again.",
    BookingSessionConsumed:
      "This booking session has already been used. Please search again.",
  },

  BookingSession: {
    InvalidRoomSelection: "Invalid room selection.",
    InvalidGuestCount: "Guest count must be at least 1.",
    InvalidDates: "Invalid booking dates.",
    RoomUnavailable: "Selected room is not available.",
    RoomCapacityExceeded: "Guest count exceeds room capacity.",
    RoomNoLongerAvailable:
      "This room is no longer available for the selected dates.",
    CreateFailed: "Unable to start booking at this time.",
    NotFound: "Booking session not found.",
    Inactive: "Booking session is no longer active.",
    Expired: "Booking session has expired.",
  },

  RoomSearch: {
    MissingSearchParameters:
      "Check-in date, check-out date, and guest count are required.",
    InvalidDates: "Please provide valid check-in and check-out dates.",
    InvalidGuestCount: "Guest count must be at least 1.",
    InvalidRating: "Minimum rating must be between 0 and 5.",
    SearchFailed: "Unable to search rooms at this time. Please try again.",
  },

  LoginPage: {
    SessionNotFound:
      "Your reservation session was not found. Choose how to continue.",
    SessionInvalid:
      "Your reservation session is no longer active. Choose how to continue.",
    SessionExpired:
      "Your reservation session has expired. Choose how to continue.",
    InvalidCredentials:
      "Invalid email or password. Use the demo member credentials shown below.",
  },

  SearchPage: {
    RoomNoLongerAvailable:
      "The selected room is no longer available. Please search again.",
    RoomUnavailableForDates:
      "This room is no longer available for the selected dates. Choose another room or change your dates.",
    RoomUnavailableForDatesWithId:
      "Room #{roomId} is no longer available for the selected dates. Choose another room or change your dates.",
    InvalidBookingSelection:
      "Your booking link is invalid. Use future check-in/check-out dates and try again.",
  },
  
  Payment: {
    TermsRequired: "Please accept the booking terms and conditions.",
    CardExpired: "Card expiry date must be this month or later.",
    BookingFailed: "Unable to complete booking.",
    SimulationNotice:
      "Payment is simulated for this demo. Card details are validated but not stored.",
  },

  Confirmation: {
    LoadFailed: "Unable to load confirmation details for this reservation.",
  },

  Authorization: {
    ViewReservationDenied:
      "You do not have permission to view this reservation.",
    SignInRequired: "Please sign in to view this reservation.",
  },

  Reservations: {
    LoadReservationFailed: "Unable to load reservation.",
    LoadListFailed: "Unable to load your reservations.",
    ModifyFailed: "Unable to modify reservation.",
    CancelFailed: "Unable to cancel reservation.",
    NotFound: "Unable to locate reservation {referenceNumber}.",
  },

  ApiClient: {
    UnexpectedResponse: "Unexpected response from booking API.",
    InvalidResponse: "Invalid response from booking API.",
    RoomNotFound: "Room not found.",
  },

  Logs: {
    RoomSearchCompleted: "Room search completed.",
    BookingCreated: "Booking created successfully.",
    BookingCancelled: "Booking cancelled successfully.",
    CreateBookingSessionFailed: "Create booking session failed.",
    GetBookingSessionFailed: "Get booking session failed.",
  },
} as const;

export function formatBookingApiStatusError(status: number): string {
  return `Booking API returned ${status}.`;
}

export function formatApiUnreachableMessage(apiUrl: string): string {
  return `Unable to reach the booking API at ${apiUrl}. Start it with: cd backend/Wynn.Booking.Api && dotnet run`;
}

export function formatReservationNotFoundMessage(referenceNumber: string): string {
  return Messages.Reservations.NotFound.replace(
    "{referenceNumber}",
    referenceNumber
  );
}