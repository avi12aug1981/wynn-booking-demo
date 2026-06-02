"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDemoUserType } from "@/app/constants/demo-user";
import { AppRoutes } from "@/app/constants/routes";

export default function DemoMemberReservationsLink() {
  const [isDemoMember, setIsDemoMember] = useState(false);

  useEffect(() => {
    setIsDemoMember(getDemoUserType() === "MEMBER");
  }, []);

  if (!isDemoMember) {
    return null;
  }

  return (
    <Link
      href={AppRoutes.reservations}
      className="inline-flex items-center rounded-sm border border-[#c9b38c] px-4 py-2 text-sm font-semibold uppercase tracking-widest text-[#c9b38c] hover:bg-[#c9b38c] hover:text-[#3a2418] transition-colors"
    >
      Reservation History
    </Link>
  );
}
