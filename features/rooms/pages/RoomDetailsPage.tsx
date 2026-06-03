import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasBookingQueryParams } from "@/app/lib/booking-query-params";
import { roomGallery } from "@/app/lib/room-gallery";
import { areStayDatesValid } from "@/app/lib/utils/date";
import { buildRoomDetailsUrl } from "@/app/constants/routes";
import { BookingErrors } from "@/app/constants/booking-errors";
import { buildLoginUrl, buildSearchUrl } from "@/app/constants/routes";
import type { PageRouteContext } from "@/features/app-router/route-types";
import BookNowButton from "@/features/booking/components/BookNowButton";
import {
  getBookingSessionDotNet,
  getRoomDetailsDotNet,
  mapDotNetSessionForBookingPage,
} from "@/lib/api/dotnet-booking-client";

import {
  Ban,
  CheckCircle,
  PawPrint,
  Star,
  Users,
} from "lucide-react";
import { getAmenityIcon } from "@/app/lib/amenity-icons";

type RoomDetailsPageProps = PageRouteContext;

function calculateNumberOfNights(checkInDate: string, checkOutDate: string) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / millisecondsPerDay
  );
}

export default async function RoomDetailsPage({
  routeParams,
  searchParams,
}: RoomDetailsPageProps) {
  const { roomId, token } = routeParams;
  const parsedRoomId = Number(roomId);

  if (!Number.isInteger(parsedRoomId) || parsedRoomId <= 0 || !token) {
    redirect(buildSearchUrl({ bookingError: BookingErrors.InvalidSelection }));
  }

  if (hasBookingQueryParams(searchParams)) {
    redirect(buildRoomDetailsUrl(parsedRoomId, token));
  }

  const { response, envelope } = await getBookingSessionDotNet(token);

  if (!response.ok || !envelope.success || !envelope.data) {
    if (response.status === 404) {
      redirect(buildLoginUrl(BookingErrors.SessionNotFound));
    }

    if (envelope.message?.toLowerCase().includes("expired")) {
      redirect(buildLoginUrl(BookingErrors.SessionExpired));
    }

    redirect(buildLoginUrl(BookingErrors.SessionInvalid));
  }

  const session = mapDotNetSessionForBookingPage({
    ...envelope.data,
    guestCount: envelope.data.guestCount,
  });

  if (session.room.id !== parsedRoomId) {
    redirect(buildSearchUrl({ bookingError: BookingErrors.InvalidSelection }));
  }

  const checkInDate = session.checkInDate.split("T")[0];
  const checkOutDate = session.checkOutDate.split("T")[0];
  const guestCount = String(session.guestCount);

  if (!areStayDatesValid(checkInDate, checkOutDate)) {
    redirect(buildSearchUrl({ bookingError: BookingErrors.InvalidSelection }));
  }

  const result = await getRoomDetailsDotNet(parsedRoomId, {
    checkInDate,
    checkOutDate,
  });

  if (!result.ok) {
    redirect(
      buildSearchUrl({
        checkInDate,
        checkOutDate,
        guestCount,
        bookingError: BookingErrors.RoomNotFound,
      })
    );
  }

  const room = result.room;
  const numberOfNights =
    room.numberOfNights ??
    calculateNumberOfNights(checkInDate, checkOutDate);

  const galleryImages = roomGallery[room.id] ?? [
    room.imageUrl || "/images/default-room.jpg",
    "/images/resort-queen.jpg",
    "/images/executive-suite.jpg",
    "/images/tower-suite.jpg",
  ];

  const searchHref = buildSearchUrl({
    checkInDate,
    checkOutDate,
    guestCount,
  });

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="bg-[#3a2418] text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-xs">
            Room Details
          </p>

          <h1 className="font-serif text-4xl mt-3">{room.name}</h1>

          <p className="text-stone-200 mt-2 max-w-2xl">{room.description}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-sm shadow-md overflow-hidden border border-stone-200">
              <Image
                src={galleryImages[0]}
                alt={room.name}
                width={1200}
                height={650}
                className="w-full h-[420px] object-cover"
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-white">
                {galleryImages.slice(0, 4).map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="relative h-24 overflow-hidden rounded-sm border border-stone-200"
                  >
                    <Image
                      src={imageUrl}
                      alt={`${room.name} gallery image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-sm shadow-md border border-stone-200 p-6">
              <h2 className="font-serif text-3xl text-[#3a2418]">
                Room Overview
              </h2>

              <p className="text-gray-700 mt-4 leading-relaxed">
                {room.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="border rounded-sm p-4 bg-[#faf8f4]">
                  <Users size={20} />
                  <p className="text-sm text-gray-500 mt-2">Maximum Guests</p>
                  <p className="font-semibold">Up to {room.maxGuests}</p>
                </div>

                <div className="border rounded-sm p-4 bg-[#faf8f4]">
                  {room.petsAllowed ? <PawPrint size={20} /> : <Ban size={20} />}
                  <p className="text-sm text-gray-500 mt-2">Pet Policy</p>
                  <p className="font-semibold">
                    {room.petsAllowed ? "Pets Allowed" : "No Pets"}
                  </p>
                </div>

                <div className="border rounded-sm p-4 bg-[#faf8f4]">
                  <CheckCircle size={20} />
                  <p className="text-sm text-gray-500 mt-2">Smoking Policy</p>
                  <p className="font-semibold">
                    {room.smokingAllowed ? "Smoking Room" : "Non-Smoking"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-sm shadow-md border border-stone-200 p-6">
              <h2 className="font-serif text-3xl text-[#3a2418]">Amenities</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                {room.amenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity);

                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 border rounded-sm p-4 bg-[#faf8f4]"
                    >
                      {Icon && <Icon size={18} />}
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-sm shadow-md border border-stone-200 p-6">
              <h2 className="font-serif text-3xl text-[#3a2418]">Policies</h2>

              <div className="space-y-3 text-sm text-gray-700 mt-5">
                <p>
                  <span className="font-semibold">Check-in:</span> 3:00 PM
                </p>
                <p>
                  <span className="font-semibold">Check-out:</span> 11:00 AM
                </p>
                <p>Valid government-issued photo ID is required at check-in.</p>
                <p>
                  Room preferences, views, and upgrades are subject to
                  availability.
                </p>
                <p>
                  Cancellation and refund eligibility may vary based on
                  reservation status and booking source.
                </p>
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-sm shadow-md border border-stone-200 p-6 h-fit lg:sticky lg:top-6">
            <p className="uppercase tracking-[0.3em] text-[#8c6b43] text-xs">
              Starting From
            </p>

            <p className="text-4xl font-semibold mt-3 text-[#3a2418]">
              ${room.pricePerNight.toFixed(2)}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              per night plus taxes and fees
            </p>

            {room.estimatedSubtotal != null && (
              <p className="text-sm text-gray-600 mt-2">
                ${room.estimatedSubtotal.toFixed(2)} estimated for {numberOfNights}{" "}
                night{numberOfNights === 1 ? "" : "s"}
              </p>
            )}

            <div className="flex items-center gap-2 mt-5 text-sm text-gray-700">
              <Star size={16} className="fill-[#8c6b43] text-[#8c6b43]" />
              <span>{room.rating.toFixed(1)}</span>
              <span>({room.reviewCount} reviews)</span>
            </div>

            <div className="border-t mt-6 pt-5 space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Room Type</span>
                <span className="font-medium">{room.type}</span>
              </div>

              <div className="flex justify-between">
                <span>Guests</span>
                <span className="font-medium">Up to {room.maxGuests}</span>
              </div>

              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-medium">{room.status}</span>
              </div>

              <div className="flex justify-between">
                <span>Check-In</span>
                <span className="font-medium">{checkInDate}</span>
              </div>

              <div className="flex justify-between">
                <span>Check-Out</span>
                <span className="font-medium">{checkOutDate}</span>
              </div>

              <div className="flex justify-between">
                <span>Selected Guests</span>
                <span className="font-medium">{guestCount}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <BookNowButton bookingSessionToken={token} fullWidth />

              <Link
                href={searchHref}
                className="block w-full text-center border border-[#3a2418] text-[#3a2418] px-6 py-3 rounded-sm uppercase tracking-widest text-sm font-semibold hover:bg-[#f7f4ef]"
              >
                Back to Search
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
