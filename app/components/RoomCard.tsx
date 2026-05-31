import Image from "next/image";
import BookNowButton from "./BookNowButton";
import { Ban, CheckCircle, PawPrint, Star, Users } from "lucide-react";
import { getAmenityIcon } from "@/app/lib/amenity-icons";
import Link from "next/link";

type RoomCardProps = {
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: string;
  onUnavailable?: (message: string) => void;
  room: {
    id: number;
    name: string;
    type: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    amenities: string[];
    imageUrl?: string | null;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    rating?: number;
    reviewCount?: number;
    numberOfNights: number;
    estimatedSubtotal: number;
  };
};

export default function RoomCard({
  room,
  checkInDate,
  checkOutDate,
  guestCount,
  onUnavailable,
}: RoomCardProps) {
  return (
    <div className="bg-white rounded-sm shadow-md overflow-hidden border border-gray-200">
      <Image
        src={room.imageUrl || "/images/default-room.jpg"}
        alt={room.name}
        width={800}
        height={400}
        className="w-full h-40 object-cover"
      />

      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[#8c6b43] font-semibold">
          {room.type}
        </p>

        <h3 className="font-serif text-2xl mt-2 text-gray-900">{room.name}</h3>

        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <Star size={16} className="fill-[#8c6b43] text-[#8c6b43]" />
          <span>{room.rating ?? 4.5}</span>
          <span>({room.reviewCount ?? 0} reviews)</span>
        </div>

        <p className="text-gray-600 mt-4">{room.description}</p>

        <div className="flex items-center gap-2 mt-4 text-sm text-gray-700">
          <Users size={16} />
          <span>Up to {room.maxGuests} guests</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {room.amenities.map((amenity) => {
            const Icon = getAmenityIcon(amenity);

            return (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700"
              >
                {Icon && <Icon size={14} />}
                {amenity}
              </span>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 text-sm">
          <span className="inline-flex items-center gap-1 text-gray-700">
            {room.petsAllowed ? <PawPrint size={15} /> : <Ban size={15} />}
            {room.petsAllowed ? "Pets allowed" : "No pets"}
          </span>

          <span className="inline-flex items-center gap-1 text-gray-700">
            <CheckCircle size={15} />
            {room.smokingAllowed ? "Smoking room" : "Non-smoking"}
          </span>
        </div>

        <div className="border-t mt-6 pt-5 flex items-center justify-between">
  <div>
    <p className="text-sm text-gray-500">From</p>
    <p className="text-3xl font-semibold text-gray-900">
      ${room.pricePerNight.toFixed(2)}
    </p>
    <p className="text-xs text-gray-500">
      per night · ${room.estimatedSubtotal.toFixed(2)} subtotal
    </p>
  </div>

  <div className="flex gap-3">
    <Link
      href={`/rooms/${room.id}`}
      className="border border-[#3a2418] text-[#3a2418] px-5 py-3 rounded-sm uppercase tracking-widest text-sm font-semibold hover:bg-stone-50"
    >
      Details
    </Link>

    <BookNowButton
      roomId={room.id}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      guestCount={guestCount}
    />
  </div>
</div>
      </div>
    </div>
  );
}