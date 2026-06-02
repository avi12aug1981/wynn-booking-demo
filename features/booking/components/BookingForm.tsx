"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  EMPTY_GUEST_DETAILS_DEFAULTS,
  getDemoGuestDetailsDefaults,
  getDemoUserType,
} from "@/app/constants/demo-user";
import { Messages } from "@/app/constants/messages";
import type { BookingType } from "@/app/types/prisma-enums";
import { markSearchResultsStale } from "@/app/constants/search-storage";
import AppButton from "@/components/ui/atoms/AppButton";
import { createBookingDotNet } from "@/lib/api/dotnet-booking-client";

const ZIP_CODE_PATTERN = /^\d{5,10}$/;
const PHONE_NUMBER_PATTERN = /^\d{10,15}$/;

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function validateZipCode(value: string, requiredMessage: string, invalidMessage: string) {
  const digits = normalizeDigits(value);

  if (!digits) {
    return requiredMessage;
  }

  if (!ZIP_CODE_PATTERN.test(digits)) {
    return invalidMessage;
  }

  return null;
}

function validatePhoneNumber(value: string) {
  const digits = normalizeDigits(value);

  if (!digits) {
    return Messages.Booking.PhoneRequired;
  }

  if (!PHONE_NUMBER_PATTERN.test(digits)) {
    return Messages.Booking.InvalidPhoneNumber;
  }

  return null;
}

const DIGIT_ONLY_NAVIGATION_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

function handleDigitOnlyKeyDown(event: KeyboardEvent<HTMLInputElement>) {
  if (DIGIT_ONLY_NAVIGATION_KEYS.has(event.key)) {
    return;
  }

  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (/^\d$/.test(event.key)) {
    return;
  }

  event.preventDefault();
}

function handleDigitsOnlyInput(event: FormEvent<HTMLInputElement>) {
  const { currentTarget } = event;
  const digitsOnly = currentTarget.value.replace(/\D/g, "");

  if (currentTarget.value !== digitsOnly) {
    currentTarget.value = digitsOnly;
  }
}

type BookingFormProps = {
  bookingSessionToken?: string;
  roomId: number;
  maxGuests: number;
  defaultCheckInDate?: string;
  defaultCheckOutDate?: string;
  defaultGuestCount?: number;
  petsAllowed?: boolean;
};

export default function BookingForm({
  bookingSessionToken,
  roomId,
  maxGuests,
  defaultCheckInDate = "",
  defaultCheckOutDate = "",
  defaultGuestCount = 1,
  petsAllowed = false,
}: BookingFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const guestDetails = isClientReady
    ? getDemoGuestDetailsDefaults()
    : EMPTY_GUEST_DETAILS_DEFAULTS;
  const bookingType: BookingType =
    isClientReady && getDemoUserType() === "MEMBER" ? "MEMBER" : "GUEST";
  const isDemoMember = bookingType === "MEMBER";

  const confirmedGuestCount = Math.min(defaultGuestCount, maxGuests);

  const searchHref =
    defaultCheckInDate && defaultCheckOutDate && confirmedGuestCount
      ? `/search?checkInDate=${defaultCheckInDate}&checkOutDate=${defaultCheckOutDate}&guestCount=${confirmedGuestCount}`
      : "/search";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const termsAccepted = formData.get("termsAccepted") === "on";

    if (!termsAccepted) {
      setErrorMessage("Please accept the booking terms and conditions.");
      setIsSubmitting(false);
      return;
    }

    const zipCode = String(formData.get("zipCode"));
    const phoneNumber = String(formData.get("phoneNumber"));
    const billingZip = String(formData.get("billingZip"));

    const zipCodeError = validateZipCode(
      zipCode,
      Messages.Booking.ZipCodeRequired,
      Messages.Booking.InvalidZipCode
    );

    if (zipCodeError) {
      setErrorMessage(zipCodeError);
      setIsSubmitting(false);
      return;
    }

    const phoneError = validatePhoneNumber(phoneNumber);

    if (phoneError) {
      setErrorMessage(phoneError);
      setIsSubmitting(false);
      return;
    }

    const billingZipError = validateZipCode(
      billingZip,
      Messages.Booking.ZipCodeRequired,
      Messages.Booking.InvalidBillingZip
    );

    if (billingZipError) {
      setErrorMessage(billingZipError);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      roomId,
      bookingSessionToken,
      bookingType,
      firstName: String(formData.get("firstName")),
      lastName: String(formData.get("lastName")),
      gender: "PREFER_NOT_TO_SAY",
      contactEmail: String(formData.get("contactEmail")),
      adultCount: confirmedGuestCount,
      childCount: 0,
      infantCount: 0,
      petCount: 0,
      checkInDate: String(formData.get("checkInDate")),
      checkOutDate: String(formData.get("checkOutDate")),
      addressLine1: String(formData.get("addressLine1")),
      addressLine2: String(formData.get("addressLine2") || ""),
      city: String(formData.get("city")),
      state: String(formData.get("state")),
      zipCode: normalizeDigits(zipCode),
      country: String(formData.get("country")),
      specialRequests: String(formData.get("specialRequests") || ""),
      guests: [
        {
          sequence: 1,
          firstName: String(formData.get("firstName")),
          lastName: String(formData.get("lastName")),
          gender: "PREFER_NOT_TO_SAY",
          ageGroup: "ADULT",
        },
      ],
    };

    const { response, envelope } = await createBookingDotNet(payload);

    if (!response.ok || !envelope.success || !envelope.data?.referenceNumber) {
      setErrorMessage(envelope.message || "Unable to complete booking.");
      setIsSubmitting(false);
      return;
    }

    markSearchResultsStale();
    window.location.replace(`/confirmation/${envelope.data.referenceNumber}`);
  }

  if (!isClientReady) {
    return (
      <div className="bg-white p-6 rounded-sm shadow-md min-h-[480px] animate-pulse" />
    );
  }

  return (
    <form
      key={bookingType}
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-sm shadow-md space-y-8"
    >
      <div>
        <p className="uppercase tracking-[0.3em] text-[#8c6b43] text-xs">
          Guest Details
        </p>
        <h2 className="font-serif text-3xl mt-2 text-[#3a2418]">
          Complete Reservation
        </h2>
        {isDemoMember && (
          <p className="text-sm text-[#8c6b43] mt-2">
            Demo member profile applied. You can edit any field before confirming.
          </p>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-sm space-y-3">
          <p>{errorMessage}</p>

          <Link
            href={searchHref}
            className="inline-flex rounded-sm bg-[#3a2418] px-4 py-2 text-sm font-semibold uppercase tracking-widest text-white hover:bg-[#2b1a11]"
          >
            Return to Search
          </Link>
        </div>
      )}
      <input type="hidden" name="checkInDate" value={defaultCheckInDate} />
      <input type="hidden" name="checkOutDate" value={defaultCheckOutDate} />
      <input type="hidden" name="adultCount" value={confirmedGuestCount} />
      <input type="hidden" name="petCount" value="0" />
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-sm font-medium">First Name</span>
          <input
            name="firstName"
            defaultValue={guestDetails.firstName}
            className="w-full border p-3 rounded-sm"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Last Name</span>
          <input
            name="lastName"
            defaultValue={guestDetails.lastName}
            className="w-full border p-3 rounded-sm"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input
            name="contactEmail"
            type="email"
            defaultValue={guestDetails.contactEmail}
            className="w-full border p-3 rounded-sm"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Phone Number</span>
          <input
            name="phoneNumber"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            pattern="[0-9]{10,15}"
            minLength={10}
            maxLength={15}
            placeholder="7025551234"
            title="Enter 10 to 15 digits"
            defaultValue={guestDetails.phoneNumber}
            className="w-full border p-3 rounded-sm"
            onKeyDown={handleDigitOnlyKeyDown}
            onInput={handleDigitsOnlyInput}
            required
          />
        </label>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Address Line 1</span>
          <input
            name="addressLine1"
            defaultValue={guestDetails.addressLine1}
            className="w-full border p-3 rounded-sm"
            required
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Address Line 2</span>
          <input
            name="addressLine2"
            defaultValue={guestDetails.addressLine2}
            className="w-full border p-3 rounded-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">City</span>
          <input
            name="city"
            defaultValue={guestDetails.city}
            className="w-full border p-3 rounded-sm"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">State</span>
          <input
            name="state"
            defaultValue={guestDetails.state}
            className="w-full border p-3 rounded-sm"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">ZIP Code</span>
          <input
            name="zipCode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="[0-9]{5,10}"
            minLength={5}
            maxLength={10}
            placeholder="89109"
            title="Enter 5 to 10 digits"
            defaultValue={guestDetails.zipCode}
            className="w-full border p-3 rounded-sm"
            onKeyDown={handleDigitOnlyKeyDown}
            onInput={handleDigitsOnlyInput}
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Country</span>
          <select
            name="country"
            className="w-full border p-3 rounded-sm"
            defaultValue={guestDetails.country}
            required
          >
            <option value="USA">United States</option>
            <option value="INDIA">India</option>
            <option value="CANADA">Canada</option>
            <option value="UK">United Kingdom</option>
          </select>
        </label>
      </section>

      <section className="border-t pt-6 space-y-4 bg-[#faf8f4] p-6 rounded-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-2xl text-[#3a2418]">
              Payment Details
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Payment is simulated for this demo. Card details are validated but
              not stored.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2 py-1 border rounded text-xs font-semibold">
              VISA
            </div>
            <div className="px-2 py-1 border rounded text-xs font-semibold">
              MC
            </div>
            <div className="px-2 py-1 border rounded text-xs font-semibold">
              AMEX
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm font-medium">Cardholder Name</span>
            <input
              name="cardHolderName"
              className="w-full border p-3 rounded-sm"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Credit Card Number</span>
            <input
              name="cardNumber"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              pattern="[0-9]*"
              minLength={13}
              maxLength={19}
              placeholder="4111111111111111"
              className="w-full border p-3 rounded-sm"
              onKeyDown={handleDigitOnlyKeyDown}
              onInput={handleDigitsOnlyInput}
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Expiry Month</span>
            <select
              name="expiryMonth"
              className="w-full border p-3 rounded-sm"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Month
              </option>
              {Array.from({ length: 12 }, (_, index) => (
                <option
                  key={index + 1}
                  value={String(index + 1).padStart(2, "0")}
                >
                  {String(index + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Expiry Year</span>
            <select
              name="expiryYear"
              className="w-full border p-3 rounded-sm"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Year
              </option>
              {Array.from({ length: 8 }, (_, index) => {
                const year = new Date().getFullYear() + index;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">CVV</span>
            <input
              name="cvv"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              pattern="[0-9]*"
              minLength={3}
              maxLength={4}
              className="w-full border p-3 rounded-sm"
              onKeyDown={handleDigitOnlyKeyDown}
              onInput={handleDigitsOnlyInput}
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Billing ZIP</span>
            <input
              name="billingZip"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              pattern="[0-9]{5,10}"
              minLength={5}
              maxLength={10}
              placeholder="89109"
              title="Enter 5 to 10 digits"
              className="w-full border p-3 rounded-sm"
              onKeyDown={handleDigitOnlyKeyDown}
              onInput={handleDigitsOnlyInput}
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Billing Country</span>
            <select
              name="billingCountry"
              className="w-full border p-3 rounded-sm"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Country
              </option>
              <option value="USA">United States</option>
              <option value="INDIA">India</option>
              <option value="CANADA">Canada</option>
              <option value="UK">United Kingdom</option>
            </select>
          </label>
        </div>
      </section>

      <section className="border-t pt-6 space-y-3">
        <label className="space-y-1 block">
          <span className="text-sm font-medium">Special Requests</span>
          <textarea
            name="specialRequests"
            className="w-full border p-3 rounded-sm"
            rows={3}
          />
        </label>

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input name="termsAccepted" type="checkbox" className="mt-1" required />
          <span>
            I agree to the booking terms, cancellation policy, and simulated
            payment authorization.
          </span>
        </label>
      </section>

      <AppButton
        type="submit"
        fullWidth
        loading={isSubmitting}
        loadingText="Processing"
      >
        Confirm Reservation
      </AppButton>
    </form>
  );
}