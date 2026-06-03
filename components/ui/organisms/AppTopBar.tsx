"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  logoutDemoSession,
} from "@/app/constants/demo-user";
import { AppRoutes } from "@/app/constants/routes";
import { useDemoSession } from "@/app/hooks/useDemoSession";
import MyReservationsLink from "@/components/ui/molecules/MyReservationsLink";

const LOGIN_PATHS = new Set(["/", "/login"]);
const SEARCH_PATH = AppRoutes.search;
const CONFIRMATION_PATH = "/confirmation";

const topBarActionClassName =
  "rounded-sm border border-[#c9b38c] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#c9b38c] hover:bg-[#2b1a11] hover:text-white";

function pathMatchesRoute(pathname: string, route: string) {
  const normalizedPath = pathname.toLowerCase();
  const normalizedRoute = route.toLowerCase();

  return (
    normalizedPath === normalizedRoute ||
    normalizedPath.startsWith(`${normalizedRoute}/`)
  );
}

export default function AppTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sessionReady, userType, memberProfile, isMember } = useDemoSession();

  if (LOGIN_PATHS.has(pathname)) {
    return null;
  }

  const isConfirmationPage = pathMatchesRoute(pathname, CONFIRMATION_PATH);
  const showSignIn =
    sessionReady && !isMember && !isConfirmationPage;

  function handleLogout() {
    logoutDemoSession();
    router.push(AppRoutes.landing);
  }

  return (
    <header className="bg-[#3a2418] text-white border-b border-[#2b1a11]">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          {!pathMatchesRoute(pathname, SEARCH_PATH) && (
            <Link
              href={SEARCH_PATH}
              className="uppercase tracking-widest text-[#c9b38c] hover:text-white"
            >
              Search
            </Link>
          )}

          <MyReservationsLink />
        </div>

        <div className="flex items-center gap-4 text-sm min-h-[28px]">
          {sessionReady && isMember && memberProfile ? (
            <span className="text-stone-200">
              {memberProfile.firstName} {memberProfile.lastName}
              <span className="text-[#c9b38c] ml-2">{memberProfile.tier}</span>
            </span>
          ) : sessionReady && userType === "GUEST" && !isConfirmationPage ? (
            <span className="text-stone-300">Guest</span>
          ) : null}

          {showSignIn && (
            <Link href={AppRoutes.login} className={topBarActionClassName}>
              Sign In
            </Link>
          )}

          {sessionReady && isMember && (
            <button
              type="button"
              onClick={handleLogout}
              className={topBarActionClassName}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
