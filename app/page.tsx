import SearchForm from "./components/SearchForm";
import RoomCard from "./components/RoomCard";
import type { RoomSearchResult } from "@/app/types/room";

type HomeProps = {
  searchParams: Promise<{
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: string;
    petsAllowed?: string;
    nonSmoking?: string;
    minRating?: string;
  }>;
};

async function getRooms(
  checkInDate?: string,
  checkOutDate?: string,
  guestCount?: string
): Promise<RoomSearchResult[]> {
  if (!checkInDate || !checkOutDate || !guestCount) {
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/rooms?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&guestCount=${guestCount}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { rooms?: RoomSearchResult[] };

  return data.rooms ?? [];
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  const rooms = await getRooms(
    params.checkInDate,
    params.checkOutDate,
    params.guestCount
  );

  const hasSearched =
  params.checkInDate &&
  params.checkOutDate &&
  params.guestCount;

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="bg-[#3a2418] text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-sm">
            Wynn Las Vegas
          </p>

          <h1 className="font-serif text-5xl mt-4">
            Experience Luxury Accommodations
          </h1>

          <p className="text-stone-200 mt-3 max-w-2xl">
            Search available rooms, review premium amenities, and complete your reservation.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
      <SearchForm
  defaultCheckInDate={params.checkInDate}
  defaultCheckOutDate={params.checkOutDate}
  defaultGuestCount={params.guestCount}
  defaultPetsAllowed={params.petsAllowed === "true"}
  defaultNonSmoking={params.nonSmoking === "true"}
  defaultMinRating={params.minRating}
/>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        {hasSearched && (
          <div className="mb-6">
            <h2 className="font-serif text-3xl text-gray-900">
              Available Rooms
            </h2>
            <p className="text-gray-600 mt-1">
              {rooms.length} room option{rooms.length === 1 ? "" : "s"} found for your stay.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        {hasSearched && rooms.length === 0 && (
          <div className="bg-white border rounded-sm p-8 text-center">
            <h3 className="font-serif text-2xl">No rooms available</h3>
            <p className="text-gray-600 mt-2">
              Please adjust your dates or guest count and try again.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}