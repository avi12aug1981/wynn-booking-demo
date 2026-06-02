export const DemoUserStorageKeys = {
  userType: "wynnDemoUserType",
} as const;

export type DemoUserType = "GUEST" | "MEMBER";

export type DemoGuestDetailsDefaults = {
  firstName: string;
  lastName: string;
  contactEmail: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export const EMPTY_GUEST_DETAILS_DEFAULTS: DemoGuestDetailsDefaults = {
  firstName: "",
  lastName: "",
  contactEmail: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "USA",
};

export const DEMO_MEMBER_GUEST_DETAILS: DemoGuestDetailsDefaults = {
  firstName: "Avadesh",
  lastName: "Demo Member",
  contactEmail: "demo.member@wynn.local",
  phoneNumber: "7025550100",
  addressLine1: "3131 Las Vegas Blvd South",
  addressLine2: "",
  city: "Las Vegas",
  state: "NV",
  zipCode: "89109",
  country: "USA",
};

export function setDemoGuestSession() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(DemoUserStorageKeys.userType, "GUEST");
}

export function setDemoMemberSession() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(DemoUserStorageKeys.userType, "MEMBER");
}

export function getDemoUserType(): DemoUserType | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = sessionStorage.getItem(DemoUserStorageKeys.userType);

  if (value === "GUEST" || value === "MEMBER") {
    return value;
  }

  return null;
}

export function getDemoGuestDetailsDefaults(): DemoGuestDetailsDefaults {
  if (getDemoUserType() === "MEMBER") {
    return { ...DEMO_MEMBER_GUEST_DETAILS };
  }

  return { ...EMPTY_GUEST_DETAILS_DEFAULTS };
}
