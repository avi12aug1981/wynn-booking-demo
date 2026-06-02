export const DemoUserStorageKeys = {
  userType: "wynnDemoUserType",
  accessToken: "wynnMemberAccessToken",
  memberProfile: "wynnMemberProfile",
} as const;

export type DemoMemberProfile = {
  memberId: number;
  email: string;
  firstName: string;
  lastName: string;
  tier: string;
};

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

/** Demo member sign-in (login page + appsettings DemoAuth). */
export const DEMO_MEMBER_CREDENTIALS = {
  email: "demo.member@wynn.local",
  password: "demo.member",
} as const;

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

  clearMemberAuthStorage();
  sessionStorage.setItem(DemoUserStorageKeys.userType, "GUEST");
}

export function setDemoMemberSession() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(DemoUserStorageKeys.userType, "MEMBER");
}

export function setDemoMemberAuth(
  profile: DemoMemberProfile,
  accessToken: string
) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(DemoUserStorageKeys.userType, "MEMBER");
  sessionStorage.setItem(DemoUserStorageKeys.accessToken, accessToken);
  sessionStorage.setItem(
    DemoUserStorageKeys.memberProfile,
    JSON.stringify(profile)
  );
}

function clearMemberAuthStorage() {
  sessionStorage.removeItem(DemoUserStorageKeys.accessToken);
  sessionStorage.removeItem(DemoUserStorageKeys.memberProfile);
}

export function getMemberAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(DemoUserStorageKeys.accessToken);
}

export function getMemberProfile(): DemoMemberProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(DemoUserStorageKeys.memberProfile);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DemoMemberProfile;
  } catch {
    return null;
  }
}

export function logoutDemoSession() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(DemoUserStorageKeys.userType);
  clearMemberAuthStorage();
}

export function isMemberAuthenticated() {
  return (
    getDemoUserType() === "MEMBER" && Boolean(getMemberAccessToken())
  );
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

export function isValidDemoMemberLogin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return (
    normalizedEmail === DEMO_MEMBER_CREDENTIALS.email &&
    password === DEMO_MEMBER_CREDENTIALS.password
  );
}

export function getDemoGuestDetailsDefaults(): DemoGuestDetailsDefaults {
  if (getDemoUserType() === "MEMBER") {
    return { ...DEMO_MEMBER_GUEST_DETAILS };
  }

  return { ...EMPTY_GUEST_DETAILS_DEFAULTS };
}
