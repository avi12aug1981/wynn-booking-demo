"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BookingErrors } from "@/app/constants/booking-errors";
import { Messages } from "@/app/constants/messages";
import {
  isValidDemoMemberLogin,
  setDemoGuestSession,
  setDemoMemberAuth,
} from "@/app/constants/demo-user";
import { loginDotNet } from "@/lib/api/dotnet-booking-client";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function continueAsGuest() {
    setDemoGuestSession();
    router.push(AppRoutes.search);
  }

  async function handleMemberLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    if (!isValidDemoMemberLogin(email, password)) {
      setLoginError(Messages.LoginPage.InvalidCredentials);
      setIsSubmitting(false);
      return;
    }

    try {
      const { response, envelope } = await loginDotNet(
        email.trim(),
        password
      );

      if (!response.ok || !envelope.success || !envelope.data?.accessToken) {
        setLoginError(
          envelope.message ?? Messages.LoginPage.InvalidCredentials
        );
        setIsSubmitting(false);
        return;
      }

      const user = envelope.data.user;

      setDemoMemberAuth(
        {
          memberId: user.memberId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tier: user.tier,
        },
        envelope.data.accessToken
      );

      router.push(AppRoutes.search);
    } catch {
      setLoginError(Messages.LoginPage.InvalidCredentials);
      setIsSubmitting(false);
    }
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
            Continue as a guest or sign in with the demo member account to
            preview a member-based reservation journey.
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
              Member Sign In
            </h2>

            <p className="text-gray-600">
              Sign in with your member email and password.
            </p>

            <form onSubmit={handleMemberLogin} className="space-y-4">
              {loginError && (
                <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {loginError}
                </div>
              )}

              <div>
                <label
                  htmlFor="member-email"
                  className="block text-xs font-semibold uppercase tracking-widest text-[#3a2418] mb-2"
                >
                  Email
                </label>
                <input
                  id="member-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  className="w-full border border-stone-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c6b43]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="member-password"
                  className="block text-xs font-semibold uppercase tracking-widest text-[#3a2418] mb-2"
                >
                  Password
                </label>
                <input
                  id="member-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full border border-stone-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c6b43]"
                  required
                />
              </div>

              <AppButton type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Signing In…" : "Sign In"}
              </AppButton>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
