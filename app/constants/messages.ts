export const Messages = {
    Common: {
        UnexpectedError:
        "An unexpected error occurred. Please try again later.",
  
      InvalidRequest:
        "Invalid request.",
  
      CreateBookingFailed:
        "Create booking API failed.",

      BookingLookupFailed:
        "Booking lookup API failed."
    },
  
    Booking: {
      RoomRequired:
        "Room is required.",
  
      FirstNameRequired:
        "First name is required.",
  
      LastNameRequired:
        "Last name is required.",
  
      ContactEmailRequired:
        "Contact email is required.",

      InvalidEmail:
        "Please provide a valid email address.",
  
      AddressRequired:
        "Address line 1 is required.",
  
      CityRequired:
        "City is required.",
  
      StateRequired:
        "State is required.",
  
      ZipCodeRequired:
        "ZIP code is required.",
  
      DatesRequired:
        "Check-in and check-out dates are required.",
  
      InvalidDates:
        "Please provide valid booking dates.",
  
      CheckoutMustBeAfterCheckin:
        "Check-out date must be after check-in date.",
  
      AdultRequired:
        "At least one adult guest is required.",

      InvalidGuestCount:
        "Guest counts cannot be negative.",
  
      InvalidGuestName:
        "Name contains invalid characters.",
  
      RoomNotAvailable:
        "Selected room is not available.",
  
      RoomCapacityExceeded:
        "Guest count exceeds room capacity.",
  
      PetsNotAllowed:
        "Pets are not allowed in the selected room.",
  
      RoomNoLongerAvailable:
        "This room is no longer available for the selected dates.",
  
      BookingCreated:
        "Booking created successfully.",

      BookingNotFound:
        "Booking not found." 
    },
  
    RoomSearch: {
      MissingSearchParameters:
        "Check-in date, check-out date, and guest count are required.",
  
      InvalidDates:
        "Please provide valid check-in and check-out dates.",
  
      InvalidGuestCount:
        "Guest count must be at least 1.",
  
      SearchFailed:
        "Unable to search rooms at this time. Please try again."
    }
  } as const;