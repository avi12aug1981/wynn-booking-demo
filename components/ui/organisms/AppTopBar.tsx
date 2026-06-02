"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getDemoUserType,
  getMemberProfile,
  isMemberAuthenticated,
  logoutDemoSession,
} from "@/app/constants/demo-user";
import { AppRoutes } from "@/app/constants/routes";

const LOGIN_PATHS = new Set(["/", "/login"]);

export default function AppTopBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (LOGIN_PATHS.has(pathname)) {
    return null;
  }

  const userType = getDemoUserType();
  const memberProfile = getMemberProfile();
  const isMember = isMemberAuthenticated();

  function handleLogout() {
    logoutDemoSession();
    router.push(AppRoutes.landing);
  }

  return (
    <header className="bg-[#3a2418] text-white border-b border-[#2b1a11]">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          <Link
            href={AppRoutes.search}
            className="uppercase tracking-widest text-[#c9b38c] hover:text-white"
          >
            Search
          </Link>

          {isMember && (
            <Link
              href={AppRoutes.reservations}
              className="uppercase tracking-widest text-stone-200 hover:text-white"
            >
              My Reservations
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          {isMember && memberProfile ? (
            <span className="text-stone-200">
              {memberProfile.firstName} {memberProfile.lastName}
              <span className="text-[#c9b38c] ml-2">{memberProfile.tier}</span>
            </span>
          ) : userType === "GUEST" ? (
            <span className="text-stone-300">Guest</span>
          ) : null}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-sm border border-[#c9b38c] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#c9b38c] hover:bg-[#2b1a11] hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
