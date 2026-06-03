export const DEMO_SESSION_CHANGED_EVENT = "wynn-demo-session-changed";

function notifyDemoSessionChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DEMO_SESSION_CHANGED_EVENT));
  }
}

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

const DEFAULT_DEMO_MEMBER_EMAIL = "demo.member@wynn.local";
const DEFAULT_DEMO_MEMBER_PASSWORD = "demo.member";

function readDemoEnv(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  return value || fallback;
}

/** Demo member sign-in (login page + appsettings DemoAuth). Override via .env — see .env.example. */
export const DEMO_MEMBER_CREDENTIALS = {
  email: readDemoEnv("NEXT_PUBLIC_DEMO_MEMBER_EMAIL", DEFAULT_DEMO_MEMBER_EMAIL),
  password: readDemoEnv("NEXT_PUBLIC_DEMO_MEMBER_PASSWORD", DEFAULT_DEMO_MEMBER_PASSWORD),
};

export const DEMO_MEMBER_GUEST_DETAILS: DemoGuestDetailsDefaults = {
  firstName: "Demo",
  lastName: "Member",
  contactEmail: DEMO_MEMBER_CREDENTIALS.email,
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
  notifyDemoSessionChanged();
}

export function setDemoMemberSession() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(DemoUserStorageKeys.userType, "MEMBER");
  notifyDemoSessionChanged();
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
  notifyDemoSessionChanged();
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
  notifyDemoSessionChanged();
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

function memberGuestDetailsFromProfile(
  profile: DemoMemberProfile
): DemoGuestDetailsDefaults {
  return {
    ...DEMO_MEMBER_GUEST_DETAILS,
    firstName: profile.firstName,
    lastName: profile.lastName,
    contactEmail: profile.email,
  };
}

export function getDemoGuestDetailsDefaults(): DemoGuestDetailsDefaults {
  if (getDemoUserType() === "MEMBER") {
    const profile = getMemberProfile();

    if (profile) {
      return memberGuestDetailsFromProfile(profile);
    }

    return { ...DEMO_MEMBER_GUEST_DETAILS };
  }

  return { ...EMPTY_GUEST_DETAILS_DEFAULTS };
}
