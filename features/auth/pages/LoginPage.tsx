"use client";

import { useRouter } from "next/navigation";
import { BookingErrors } from "@/app/constants/booking-errors";
import { Messages } from "@/app/constants/messages";
import {
  setDemoGuestSession,
  setDemoMemberSession,
} from "@/app/constants/demo-user";
import { AppRoutes } from "@/app/constants/routes";
import AppButton from "@/components/ui/atoms/AppButton";

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSessionErrorMessage(bookingError: string | undefined) {
  switch (bookingError) {
    case BookingErrors.SessionNotFound:
      return Messages.LoginPage.SessionNotFound;
    case BookingErrors.SessionInvalid:
      return Messages.LoginPage.SessionInvalid;
    case BookingErrors.SessionExpired:
      return Messages.LoginPage.SessionExpired;
    default:
      return null;
  }
}

export default function LoginPage({ searchParams = {} }: LoginPageProps) {
  const router = useRouter();
  const sessionErrorMessage = getSessionErrorMessage(
    getSingleQueryValue(searchParams.bookingError)
  );

  function continueAsGuest() {
    setDemoGuestSession();
    router.push(AppRoutes.search);
  }

  function continueAsDemoMember() {
    setDemoMemberSession();
    router.push(AppRoutes.search);
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="bg-[#3a2418] text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-xs">
            Wynn Las Vegas
          </p>

          <h1 className="font-serif text-4xl mt-4">
            Choose Your Booking Experience
          </h1>

          <p className="text-stone-200 mt-3 max-w-2xl">
            Continue as a guest or use a demo member profile to preview a
            member-based reservation journey.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10">
        {sessionErrorMessage && (
          <div className="mb-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {sessionErrorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-sm shadow-md p-6 space-y-4">
            <h2 className="font-serif text-3xl text-[#3a2418]">
              Guest Booking
            </h2>

            <p className="text-gray-600">
              Book without signing in. Guest details are entered during
              checkout.
            </p>

            <AppButton type="button" fullWidth onClick={continueAsGuest}>
              Continue as Guest
            </AppButton>
          </div>

          <div className="bg-white border rounded-sm shadow-md p-6 space-y-4">
            <h2 className="font-serif text-3xl text-[#3a2418]">
              Demo Member
            </h2>

            <p className="text-gray-600">
              Preview a member booking experience with a controlled demo
              profile.
            </p>

            <div className="rounded-sm bg-[#faf8f4] border p-4 text-sm">
              <p className="font-semibold">Avadesh Demo Member</p>
              <p className="text-gray-600">Gold Member</p>
              <p className="text-gray-600">demo.member@wynn.local</p>
            </div>

            <AppButton type="button" fullWidth onClick={continueAsDemoMember}>
              Continue as Demo Member
            </AppButton>
          </div>
        </div>
      </section>
    </main>
  );
}
