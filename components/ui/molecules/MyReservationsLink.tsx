"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemoSession } from "@/app/hooks/useDemoSession";
import { AppRoutes } from "@/app/constants/routes";

export const myReservationsLinkClassName =
  "uppercase tracking-widest text-stone-200 hover:text-white";

type MyReservationsLinkProps = {
  className?: string;
};

function pathMatchesRoute(pathname: string, route: string) {
  const normalizedPath = pathname.toLowerCase();
  const normalizedRoute = route.toLowerCase();

  return (
    normalizedPath === normalizedRoute ||
    normalizedPath.startsWith(`${normalizedRoute}/`)
  );
}

export default function MyReservationsLink({
  className = myReservationsLinkClassName,
}: MyReservationsLinkProps) {
  const pathname = usePathname();
  const { sessionReady, isMember } = useDemoSession();

  if (
    !sessionReady ||
    !isMember ||
    pathMatchesRoute(pathname, AppRoutes.reservations)
  ) {
    return null;
  }

  return (
    <Link href={AppRoutes.reservations} className={className}>
      My Reservations
    </Link>
  );
}
