import MarkSearchStale from "@/app/components/MarkSearchStale";

type ConfirmationPageProps = {
    params: Promise<{
      referenceNumber: string;
    }>;
  };
  
  async function getBooking(referenceNumber: string) {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  
    const response = await fetch(
      `${baseUrl}/api/bookings/${referenceNumber}`,
      {
        cache: "no-store",
      }
    );
  
    if (!response.ok) {
      return null;
    }
  
    const data = await response.json();
  
    return data.data;
  }
  
  export default async function ConfirmationPage({
    params,
  }: ConfirmationPageProps) {
    const { referenceNumber } = await params;
  
    const booking = await getBooking(referenceNumber);
  
    if (!booking) {
      return (
        <main className="min-h-screen bg-[#f7f4ef] px-6 py-10">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-sm shadow">
            <h1 className="font-serif text-4xl">
              Reservation Not Found
            </h1>
  
            <p className="text-gray-600 mt-3">
              Unable to locate reservation {referenceNumber}.
            </p>
          </div>
        </main>
      );
    }
  
    const guestCount =
      booking.adultCount +
      booking.childCount +
      booking.infantCount;
  
    return (
      <main className="min-h-screen bg-[#f7f4ef]">
        <MarkSearchStale />
        <section className="bg-[#3a2418] text-white">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-sm">
              Reservation Confirmed
            </p>
  
            <h1 className="font-serif text-5xl mt-4">
              Thank You For Your Reservation
            </h1>
  
            <p className="text-stone-200 mt-3">
              Your stay has been successfully reserved.
            </p>
          </div>
        </section>
  
        <section className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-white rounded-sm shadow-md border border-stone-200 p-8">
  
            <div className="border-b pb-6 mb-6">
              <h2 className="font-serif text-3xl text-[#3a2418]">
                Confirmation #{booking.referenceNumber}
              </h2>
  
              <p className="text-green-700 mt-2 font-medium">
                Booking Confirmed
              </p>
            </div>
  
            <div className="grid md:grid-cols-2 gap-8">
  
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Guest Information
                </h3>
  
                <div className="space-y-2 text-gray-700">
                  <p>
                    {booking.firstName} {booking.lastName}
                  </p>
  
                  <p>{booking.contactEmail}</p>
  
                  <p>
                    {booking.addressLine1}
                  </p>
  
                  <p>
                    {booking.city}, {booking.state}
                  </p>
                </div>
              </div>
  
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Stay Information
                </h3>
  
                <div className="space-y-2 text-gray-700">
                  <p>
                    Room: {booking.room.name}
                  </p>
  
                  <p>
                    Check-In:
                    {" "}
                    {new Date(
                      booking.checkInDate
                    ).toLocaleDateString()}
                    {" "}
                    (3:00 PM)
                  </p>
  
                  <p>
                    Check-Out:
                    {" "}
                    {new Date(
                      booking.checkOutDate
                    ).toLocaleDateString()}
                    {" "}
                    (11:00 AM)
                  </p>
  
                  <p>
                    Nights:
                    {" "}
                    {booking.numberOfNights}
                  </p>
  
                  <p>
                    Guests:
                    {" "}
                    {guestCount}
                  </p>
                </div>
              </div>
            </div>
  
            <div className="border-t mt-8 pt-6">
              <h3 className="font-semibold text-lg mb-4">
                Payment Summary
              </h3>
  
              <div className="space-y-2 text-gray-700">
                <p>
                  Payment Status:
                  {" "}
                  {booking.paymentStatus}
                </p>
  
                <p>
                  Total Amount:
                  {" "}
                  ${Number(booking.totalPrice).toFixed(2)}
                </p>
              </div>
            </div>
  
            {booking.specialRequests && (
              <div className="border-t mt-8 pt-6">
                <h3 className="font-semibold text-lg mb-2">
                  Special Requests
                </h3>
  
                <p className="text-gray-700">
                  {booking.specialRequests}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }