export const ApplicationConstants = {
  DefaultCountry: "USA",

  TaxRate: 0.13,

  BookingSource: "WEB",

  ConfirmationPrefix: "WYNN",

  PaymentPrefix: "PAY",

  /** Checkout form session TTL — flow state only, not an inventory hold. */
  BookingSessionTimeoutMinutes: 15,

  MaxSpecialRequestLength: 500,

  MaxFirstNameLength: 50,

  MaxLastNameLength: 50,
} as const;
