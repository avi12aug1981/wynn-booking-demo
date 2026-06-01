export const LogEvents = {
    ApiRequestStarted: "API_REQUEST_STARTED",
    ApiRequestCompleted: "API_REQUEST_COMPLETED",
    ApiRequestFailed: "API_REQUEST_FAILED",
  
    BookingCreated: "BOOKING_CREATED",
    BookingCancelled: "BOOKING_CANCELLED",
  
    BookingSessionCreated: "BOOKING_SESSION_CREATED",
    BookingSessionExpired: "BOOKING_SESSION_EXPIRED",
    BookingSessionConsumed: "BOOKING_SESSION_CONSUMED",
  
    RoomAvailabilityChecked: "ROOM_AVAILABILITY_CHECKED",
    RoomSearchCompleted: "ROOM_SEARCH_COMPLETED",
  } as const;