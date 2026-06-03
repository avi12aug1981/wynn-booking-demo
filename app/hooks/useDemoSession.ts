"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  type DemoMemberProfile,
  type DemoUserType,
  getDemoUserType,
  getMemberProfile,
  isMemberAuthenticated,
} from "@/app/constants/demo-user";

import { DEMO_SESSION_CHANGED_EVENT } from "@/app/constants/demo-user";

export function useDemoSession() {
  const pathname = usePathname();
  const [sessionReady, setSessionReady] = useState(false);
  const [userType, setUserType] = useState<DemoUserType | null>(null);
  const [memberProfile, setMemberProfile] = useState<DemoMemberProfile | null>(
    null
  );
  const [isMember, setIsMember] = useState(false);

  const refreshSession = useCallback(() => {
    setUserType(getDemoUserType());
    setMemberProfile(getMemberProfile());
    setIsMember(isMemberAuthenticated());
    setSessionReady(true);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [pathname, refreshSession]);

  useEffect(() => {
    const handleSessionChange = () => refreshSession();

    window.addEventListener(DEMO_SESSION_CHANGED_EVENT, handleSessionChange);
    window.addEventListener("storage", handleSessionChange);

    return () => {
      window.removeEventListener(DEMO_SESSION_CHANGED_EVENT, handleSessionChange);
      window.removeEventListener("storage", handleSessionChange);
    };
  }, [refreshSession]);

  return {
    sessionReady,
    userType,
    memberProfile,
    isMember,
    refreshSession,
  };
}
