import { getMemberProfile } from "@/app/constants/demo-user";

export function getMemberAuditContext(): {
  memberId?: number;
  memberEmail?: string;
} {
  if (typeof window === "undefined") {
    return {};
  }

  const profile = getMemberProfile();

  if (!profile) {
    return {};
  }

  return {
    memberId: profile.memberId,
    memberEmail: profile.email,
  };
}
