export const ValidationMessages = {
  RequiredField: "This field is required.",
  RoomRequired: "Room is required.",
  InvalidEmail: "Please enter a valid email address.",
  InvalidDate: "Please enter a valid date.",
  InvalidGuestCount: "Guest count must be at least 1.",
  CheckOutAfterCheckIn: "Check-out date must be after check-in date.",
  CheckInCannotBePast: "Check-in date cannot be in the past.",
} as const;