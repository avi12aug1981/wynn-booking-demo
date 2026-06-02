import Link from "next/link";

const demoReservations = [
  {
    referenceNumber: "WYN-2026-1001",
    roomName: "Resort King",
    stayDates: "Jun 4, 2026 - Jun 6, 2026",
    guests: 2,
    status: "Confirmed",
  },
  {
    referenceNumber: "WYN-2026-1002",
    roomName: "Tower Suite",
    stayDates: "Jul 10, 2026 - Jul 13, 2026",
    guests: 3,
    status: "Upcoming",
  },
];

export default function ReservationHistoryPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="bg-[#3a2418] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-xs">
            Member Reservations
          </p>

          <h1 className="font-serif text-4xl mt-4">
            Reservation History
          </h1>

          <p className="text-stone-200 mt-3 max-w-2xl">
            Review upcoming stays, view reservation details, or start a modify
            or cancellation workflow.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white border rounded-sm shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b bg-[#faf8f4]">
            <p className="text-sm text-gray-500">Demo Member</p>
            <h2 className="font-serif text-2xl text-[#3a2418]">
              Avadesh Demo Member
            </h2>
            <p className="text-sm text-gray-600">
              Gold Member · demo.member@wynn.local
            </p>
          </div>

          <div className="divide-y">
            {demoReservations.map((reservation) => (
              <div
                key={reservation.referenceNumber}
                className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_0.6fr_1fr] gap-4 px-6 py-5 items-center"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#8c6b43]">
                    Reference
                  </p>
                  <p className="font-semibold">{reservation.referenceNumber}</p>
                  <p className="text-sm text-gray-600">{reservation.roomName}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Stay Dates
                  </p>
                  <p>{reservation.stayDates}</p>
                  <p className="text-sm text-gray-600">
                    {reservation.guests} guests
                  </p>
                </div>

                <div>
                  <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 border border-green-200">
                    {reservation.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Link
                    href={`/reservations/${reservation.referenceNumber}`}
                    className="rounded-sm border border-[#3a2418] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#3a2418] hover:bg-[#f7f4ef]"
                  >
                    View
                  </Link>

                  <Link
                    href={`/reservations/${reservation.referenceNumber}?action=modify`}
                    className="rounded-sm border border-[#3a2418] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#3a2418] hover:bg-[#f7f4ef]"
                  >
                    Modify
                  </Link>

                  <Link
                    href={`/reservations/${reservation.referenceNumber}?action=cancel`}
                    className="rounded-sm bg-[#3a2418] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[#2b1a11]"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex rounded-sm border border-[#3a2418] px-5 py-3 text-sm font-semibold uppercase tracking-widest text-[#3a2418] hover:bg-white"
          >
            Search New Stay
          </Link>
        </div>
      </section>
    </main>
  );
}