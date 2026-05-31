"use client";

import { useState } from "react";
import { markSearchResultsStale } from "@/app/constants/search-storage";
import { CreditCard } from "lucide-react";
import AppButton from "./AppButton";

  type BookingFormProps = {
    bookingSessionToken?: string;
    roomId: number;
    defaultCheckInDate?: string;
    defaultCheckOutDate?: string;
    defaultGuestCount?: number;
    petsAllowed?: boolean;
  };

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export default function BookingForm({
  bookingSessionToken,
  roomId,
  defaultCheckInDate = "",
  defaultCheckOutDate = "",
  defaultGuestCount = 1,
  petsAllowed = false,
}: BookingFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = getTodayDate();

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

    const payload = {
      roomId,
      bookingSessionToken,
      bookingType: "GUEST",
      firstName: String(formData.get("firstName")),
      lastName: String(formData.get("lastName")),
      gender: String(formData.get("gender")),
      contactEmail: String(formData.get("contactEmail")),
      adultCount: Number(formData.get("adultCount")),
      childCount: Number(formData.get("childCount") || 0),
      infantCount: Number(formData.get("infantCount") || 0),
      petCount: Number(formData.get("petCount") || 0),
      checkInDate: String(formData.get("checkInDate")),
      checkOutDate: String(formData.get("checkOutDate")),
      addressLine1: String(formData.get("addressLine1")),
      addressLine2: String(formData.get("addressLine2") || ""),
      city: String(formData.get("city")),
      state: String(formData.get("state")),
      zipCode: String(formData.get("zipCode")),
      country: String(formData.get("country")),
      specialRequests: String(formData.get("specialRequests") || ""),
      guests: [
        {
          sequence: 1,
          firstName: String(formData.get("firstName")),
          lastName: String(formData.get("lastName")),
          gender: String(formData.get("gender")),
          ageGroup: "ADULT",
        },
      ],
    };

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      setErrorMessage(result.message || "Unable to complete booking.");
      setIsSubmitting(false);
      return;
    }

    markSearchResultsStale();
    window.location.replace(`/confirmation/${result.data.referenceNumber}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-md space-y-8">
      <div>
        <p className="uppercase tracking-[0.3em] text-[#8c6b43] text-xs">
          Guest Details
        </p>
        <h2 className="font-serif text-3xl mt-2 text-[#3a2418]">
          Complete Reservation
        </h2>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-sm">
          {errorMessage}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-sm font-medium">First Name</span>
          <input name="firstName" className="w-full border p-3 rounded-sm" required />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Last Name</span>
          <input name="lastName" className="w-full border p-3 rounded-sm" required />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input name="contactEmail" type="email" className="w-full border p-3 rounded-sm" required />
        </label>
<label className="space-y-1">
  <span className="text-sm font-medium">Phone Number</span>
  <input
    name="phoneNumber"
    type="tel"
    placeholder="7025551234"
    className="w-full border p-3 rounded-sm"
    required
  />
</label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Gender</span>
          <select name="gender" className="w-full border p-3 rounded-sm" required defaultValue="">
            <option value="" disabled>Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </label>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="hidden" name="checkInDate" value={defaultCheckInDate} />
          <input type="hidden" name="checkOutDate" value={defaultCheckOutDate} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
</div>
        <label className="space-y-1">
          <span className="text-sm font-medium">Adults</span>
          <input
            name="adultCount"
            type="number"
            min="1"
            defaultValue={defaultGuestCount}
            className="w-full border p-3 rounded-sm"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Children</span>
          <input name="childCount" type="number" min="0" defaultValue="0" className="w-full border p-3 rounded-sm" />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Infants</span>
          <input name="infantCount" type="number" min="0" defaultValue="0" className="w-full border p-3 rounded-sm" />
        </label>

        <label className="space-y-1">
  <span className="text-sm font-medium">Pets</span>

  <input
    name="petCount"
    type="number"
    min="0"
    max={petsAllowed ? 2 : 0}
    defaultValue="0"
    disabled={!petsAllowed}
    className="w-full border p-3 rounded-sm disabled:bg-gray-100 disabled:text-gray-500"
  />

  <span
    className={`block text-xs ${
      petsAllowed ? "text-green-600" : "text-red-500"
    }`}
  >
    {petsAllowed
      ? "This room allows up to 2 pets."
      : "Pets are not permitted in this room."}
  </span>
</label>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Address Line 1</span>
          <input name="addressLine1" className="w-full border p-3 rounded-sm" required />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Address Line 2</span>
          <input name="addressLine2" className="w-full border p-3 rounded-sm" />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">City</span>
          <input name="city" className="w-full border p-3 rounded-sm" required />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">State</span>
          <input name="state" className="w-full border p-3 rounded-sm" required />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">ZIP Code</span>
          <input name="zipCode" className="w-full border p-3 rounded-sm" required />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Country</span>
          <select name="country" className="w-full border p-3 rounded-sm" defaultValue="USA" required>
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
      Payment is simulated for this demo. Card details are validated but not stored.
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
            <input name="cardHolderName" className="w-full border p-3 rounded-sm" required />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Credit Card Number</span>
            <input
              name="cardNumber"
              inputMode="numeric"
              minLength={13}
              maxLength={19}
              placeholder="4111111111111111"
              className="w-full border p-3 rounded-sm"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Expiry Month</span>
            <select name="expiryMonth" className="w-full border p-3 rounded-sm" required defaultValue="">
              <option value="" disabled>Month</option>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={String(index + 1).padStart(2, "0")}>
                  {String(index + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Expiry Year</span>
            <select name="expiryYear" className="w-full border p-3 rounded-sm" required defaultValue="">
              <option value="" disabled>Year</option>
              {Array.from({ length: 8 }, (_, index) => {
                const year = new Date().getFullYear() + index;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">CVV</span>
            <input name="cvv" inputMode="numeric" minLength={3} maxLength={4} className="w-full border p-3 rounded-sm" required />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Billing ZIP</span>
            <input name="billingZip" className="w-full border p-3 rounded-sm" required />
          </label>
          <label className="space-y-1">
  <span className="text-sm font-medium">Billing Country</span>
  <select
    name="billingCountry"
    className="w-full border p-3 rounded-sm"
    defaultValue="USA"
    required
  >
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
          <textarea name="specialRequests" className="w-full border p-3 rounded-sm" rows={3} />
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